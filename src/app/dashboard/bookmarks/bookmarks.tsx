import Link from "next/link";
import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
} from "~/components/cult/minimal-card";
import { db } from "~/db";
import { CreateBookmarkForm } from "./create-bookmark-form";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({
  share = false,
}: {
  share?: boolean;
}) {
  const bookmarks = await db.query.bookmarksTable.findMany({
    orderBy: (bookmarksTable, { desc }) => [desc(bookmarksTable.updatedAt)],
    with: {
      link: true,
      bookmarksToTags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {!share && <CreateBookmarkForm />}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:flex 2xl:flex-wrap">
        {bookmarks.map(({ id, title, link: { imageUrl }, bookmarksToTags }) => (
          <li key={id}>
            <MinimalCard className="2xl:w-96">
              {/* TODO: dummy image for imageUrl is null */}
              <MinimalCardImage
                src={imageUrl ?? "/xmark-solid-full.svg"}
                alt={title ?? ""}
              />
              <MinimalCardTitle className="line-clamp-3">
                {!share ? (
                  <Link href={`/dashboard/bookmarks/${id}`}>{title}</Link>
                ) : (
                  <Link href={`/share/bookmarks/${id}`}>{title}</Link>
                )}
              </MinimalCardTitle>
              <MinimalCardDescription className="flex gap-1">
                {bookmarksToTags.map(({ tag: { id, name } }) => (
                  <span key={id}>#{name}</span>
                ))}
              </MinimalCardDescription>
            </MinimalCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
