"use server";

import { betterFetch } from "@better-fetch/fetch";
import { logger } from "@better-fetch/logger";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";
import slugify from "@sindresorhus/slugify";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/db";
import {
  bookmarksTable,
  bookmarksToTagsTable,
  githubReposTable,
  nodejsProjectsTable,
  nodejsProjectsToNpmPackagesTable,
  npmPackagesTable,
} from "~/db/schema";
import { actionClient, authActionClient } from "~/lib/safe-action";
import {
  bindArgsSchemas,
  bindGithubUrlSchemas,
  updateTagsSchema,
  updateTitleSchema,
} from "./validation";

async function updateTitle({
  bookmarkId,
  title,
}: {
  bookmarkId: string;
  title: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(bookmarksTable)
    .set({ title })
    .where(eq(bookmarksTable.id, bookmarkId));
}

export const updateTitleAction = actionClient
  .schema(updateTitleSchema)
  .bindArgsSchemas(bindArgsSchemas)
  .action(
    async ({ parsedInput: { title }, bindArgsParsedInputs: [bookmarkId] }) => {
      await updateTitle({
        bookmarkId,
        title,
      });

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );

export const updateTagsAction = authActionClient
  .schema(updateTagsSchema)
  .bindArgsSchemas(bindArgsSchemas)
  .action(
    async ({
      ctx: { userId },
      parsedInput: { tagNames },
      bindArgsParsedInputs: [bookmarkId],
    }) => {
      await db.transaction(async (tx) => {
        const bookmark = await db.query.bookmarksTable.findFirst({
          where: (bookmarks, { and, eq }) =>
            and(eq(bookmarks.userId, userId), eq(bookmarks.id, bookmarkId)),
          with: {
            bookmarksToTags: {
              with: {
                tag: true,
              },
            },
          },
        });
        if (!bookmark) {
          throw new Error("Bookmark not found");
        }

        const tags = bookmark.bookmarksToTags.map(({ tag }) => tag);

        const bookmarkTags = await tx.query.bookmarkTagsTable.findMany({
          where: (bookmarkTags, { and, eq, inArray }) =>
            and(
              eq(bookmarkTags.userId, userId),
              inArray(bookmarkTags.name, tagNames),
            ),
        });
        const tagIds = bookmarkTags.map(({ id }) => id);
        const detach = tags
          .map(({ id }) => id)
          .filter((tagId) => !tagIds.includes(tagId));
        const attach = tagIds.filter(
          (tagId) => !tags.map(({ id }) => id).includes(tagId),
        );

        const idsToRemove: string[] = [];
        if (detach.length > 0) {
          detach.forEach((tagId) => {
            idsToRemove.push(tagId);
          });

          await tx
            .delete(bookmarksToTagsTable)
            .where(
              and(
                eq(bookmarksToTagsTable.bookmarkId, bookmarkId),
                inArray(bookmarksToTagsTable.tagId, idsToRemove),
              ),
            );
        }

        if (attach.length > 0) {
          await tx
            .insert(bookmarksToTagsTable)
            .values(
              attach.map((tagId) => ({
                tagId,
                bookmarkId,
              })),
            )
            .onConflictDoNothing();
        }
      });

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );

export const createNodejsProjectAction = authActionClient
  .bindArgsSchemas(bindGithubUrlSchemas)
  .action(
    async ({ ctx: { userId }, bindArgsParsedInputs: [bookmarkId, url] }) => {
      const githubUrl = "https://github.com";
      const { origin, pathname } = new URL(url);
      if (origin !== githubUrl) {
        throw new Error("Invalid URL");
      }
      const [owner, repo] = pathname.split("/").filter(Boolean);
      if (!owner || !repo) {
        throw new Error("Invalid URL");
      }
      const [, reposPath] = pathname.split(`${owner}/${repo}`).filter(Boolean);

      const client = await clerkClient();
      const { data: tokens } = await client.users.getUserOauthAccessToken(
        userId,
        "oauth_github",
      );
      const tokenData = tokens[0];
      if (!tokenData) {
        throw new Error("GitHub token not found");
      }
      const octokit = new Octokit({
        auth: tokenData.token,
      });

      const {
        data: {
          id: repoId,
          full_name: fullName,
          html_url: repoHtmlUrl,
          description,
          stargazers_count: stargazersCount,
          pushed_at,
        },
      } = await octokit.repos.get({ owner, repo });

      // const {
      //   data: { items },
      // } = await octokit.rest.search.code({
      //   q: `repo:${owner}/${repo} filename:package.json`,
      // });
      // console.log(items);

      // /blob/{brach}/path/to/package.json の場合、package.jsonのパスを取得
      const packageJsonPath = reposPath?.match(/^\/blob\/.*\/package.json$/)
        ? `/${reposPath.split("/").slice(3).join("/")}`
        : "package.json";

      const { data: contentData } = await octokit.repos.getContent({
        owner,
        repo,
        path: packageJsonPath,
      });
      if (
        Array.isArray(contentData) ||
        !contentData.html_url ||
        !contentData.download_url
      ) {
        throw new Error("download_url not found");
      }
      const { path, html_url: htmlUrl, download_url } = contentData;
      const { dependencies, devDependencies } = await betterFetch(
        download_url,
        {
          output: z.object({
            dependencies: z.record(z.string(), z.string()).optional(),
            devDependencies: z.record(z.string(), z.string()).optional(),
          }),
          plugins: [logger()],
          throw: true,
        },
      );
      const npmPackages = Object.keys({ ...dependencies, ...devDependencies });
      const requirePackageForNodejs =
        await db.query.nodejsProjectRequirePackageTable.findMany({
          where: (nodejsProjectRequirePackageTable, { eq }) =>
            eq(nodejsProjectRequirePackageTable.userId, userId),
        });
      const requireCheckPackages =
        requirePackageForNodejs.length > 0
          ? requirePackageForNodejs
          : [{ packageName: "next" }];
      const checkResult = requireCheckPackages.map(({ packageName }) =>
        npmPackages.includes(packageName),
      );
      if (!checkResult.includes(true)) {
        throw new Error(
          `Node.js project required, ${requireCheckPackages.map(({ packageName }) => packageName).join(" or ")}`,
        );
      }

      //if (!npmPackages.includes("next")) {
      //  throw new Error("Next.js project required");
      //}

      await db.transaction(async (tx) => {
        await tx
          .insert(githubReposTable)
          .values({
            id: repoId,
            owner,
            name: repo,
            fullName,
            htmlUrl: repoHtmlUrl,
            description,
            stargazersCount,
            pushedAt: pushed_at ? new Date(pushed_at) : null,
            crawledAt: new Date(),
          })
          .onConflictDoNothing();
        // isExisting nodejs project ?
        const nodejsProject = await tx.query.nodejsProjectsTable.findFirst({
          where: (nodejsProjectsTable, { eq }) =>
            and(
              eq(nodejsProjectsTable.repoId, repoId),
              eq(nodejsProjectsTable.path, path),
            ),
        });
        const createNodejsProject = async () => {
          const [{ id: projectId }] = (await tx
            .insert(nodejsProjectsTable)
            .values({
              repoId,
              path,
              htmlUrl,
            })
            .returning({ id: nodejsProjectsTable.id })) as [{ id: string }];
          return projectId;
        };
        const projectId = nodejsProject?.id ?? (await createNodejsProject());
        await tx
          .insert(npmPackagesTable)
          .values(npmPackages.map((name) => ({ id: slugify(name), name })))
          .onConflictDoNothing();
        await tx
          .insert(nodejsProjectsToNpmPackagesTable)
          .values(
            npmPackages.map((name) => ({
              projectId,
              packageId: slugify(name),
            })),
          )
          .onConflictDoNothing();
        //
        // auto tagging
        //
        // get auto tagging setting
        const autoTags = await tx.query.autoTagsForNpmPackagesTable.findMany({
          where: (autoTagsForNpmPackagesTable, { eq }) =>
            eq(autoTagsForNpmPackagesTable.userId, userId),
          with: {
            tag: true,
            keyword: true,
          },
        });
        const taggingTags = autoTags.filter((autoTag) =>
          autoTag.keyword.find((k) => npmPackages.includes(k.keyword)),
        );
        // setting tags
        if (taggingTags.length > 0) {
          await tx
            .insert(bookmarksToTagsTable)
            .values(taggingTags.map(({ tagId }) => ({ tagId, bookmarkId })))
            .onConflictDoNothing();
        }
      });

      revalidatePath("/");

      return {
        successful: true,
      };
    },
  );
