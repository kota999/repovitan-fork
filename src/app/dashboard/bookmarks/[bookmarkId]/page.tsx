import { auth } from "@clerk/nextjs/server";
import { TagIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { badgeVariants } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { db } from "~/db";
import { CreateNodejsProjectButton } from "./create-nodejs-project-button";
import { EditableTitle } from "./editable-title";
import { MultiSelectTags } from "./multi-select-tags";
import { getBookmarkTags } from "~/db/query";

export default async function BookmarkPage({
  params,
}: {
  params: Promise<{ bookmarkId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { bookmarkId } = await params;
  const bookmark = await db.query.bookmarksTable.findFirst({
    where: (bookmarks, { eq }) => eq(bookmarks.id, bookmarkId),
    with: {
      link: true,
      bookmarksToTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!bookmark) {
    notFound();
  }

  const bookmarkTags = await getBookmarkTags(userId);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4">
        <EditableTitle bookmarkId={bookmarkId} title={bookmark.title ?? ""} />
        {bookmark.link.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.link.imageUrl}
            alt={bookmark.link.title ?? ""}
            className="w-full max-w-lg rounded-lg border"
          />
        )}
        <p>{bookmark.link.title}</p>
        <p>{bookmark.link.description}</p>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookmark.link.favicon ?? ""} alt="" className="size-5" />
          <Link href={bookmark.link.url} target="_blank">
            {bookmark.link.url}
          </Link>
        </div>
        <div className="flex gap-2">
          <TagIcon />
          {bookmark.bookmarksToTags.map(({ tag: { id, name } }) => (
            <Link
              key={id}
              href={`/dashboard/bookmark-tags/${id}`}
              className={badgeVariants()}
            >
              {name}
            </Link>
          ))}
        </div>
        <div>
          <MultiSelectTags
            bookmarkId={bookmarkId}
            tags={bookmark.bookmarksToTags.map(({ tag: { id, name } }) => ({
              id,
              name,
            }))}
            bookmarkTags={bookmarkTags}
          />
        </div>
        <div>
          <CreateNodejsProjectButton
            bookmarkId={bookmarkId}
            url={bookmark.link.url}
          />
        </div>
      </div>
      <Separator />
    </div>
  );
}
