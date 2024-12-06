import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
} from "~/components/cult/minimal-card";
import { db } from "~/db";

export default async function BookmarkListPage({
  params,
}: {
  params: Promise<{ bookmarkListId: string }>;
}) {
  const { bookmarkListId } = await params;
  const bookmarkList = await db.query.bookmarkListsTable.findFirst({
    where: (bookmarkListsTable, { eq }) =>
      eq(bookmarkListsTable.id, bookmarkListId),
    with: {
      children: true,
      bookmarksToLists: {
        with: {
          bookmark: {
            with: {
              link: true,
              bookmarksToTags: {
                with: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!bookmarkList) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{bookmarkList.name}</div>
      <ul className="list-inside list-disc">
        {bookmarkList.children.map(({ id, name }) => (
          <li key={id}>
            <Link href={`/dashboard/bookmark-lists/${id}`}>{name}</Link>
          </li>
        ))}
      </ul>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:flex 2xl:flex-wrap">
        {bookmarkList.bookmarksToLists.map(
          ({
            bookmark: {
              id,
              title,
              link: { imageUrl },
              bookmarksToTags,
            },
          }) => (
            <li key={id}>
              <MinimalCard className="2xl:w-96">
                <MinimalCardImage src={imageUrl ?? ""} alt={title ?? ""} />
                <MinimalCardTitle className="line-clamp-3">
                  <Link href={`/dashboard/bookmarks/${id}`}>{title}</Link>
                </MinimalCardTitle>
                <MinimalCardDescription className="flex gap-1">
                  {bookmarksToTags.map(({ tag: { id, name } }) => (
                    <span key={id}>#{name}</span>
                  ))}
                </MinimalCardDescription>
              </MinimalCard>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
