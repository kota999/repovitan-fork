import Link from "next/link";
import { db } from "~/db";
import { CreateBookmarkListForm } from "./create-bookmark-list-form";

export const dynamic = "force-dynamic";

export default async function BookmarkListsPage() {
  const bookmarkLists = await db.query.bookmarkListsTable.findMany({
    where: (bookmarkListsTable, { isNull }) =>
      isNull(bookmarkListsTable.parentId),
    orderBy: (bookmarkListsTable, { desc }) => [
      desc(bookmarkListsTable.updatedAt),
    ],
    with: {
      children: true,
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkListForm />
      <ul className="list-inside list-disc">
        {bookmarkLists.map(({ id, name, children }) => (
          <li key={id}>
            <Link href={`/dashboard/bookmark-lists/${id}`}>{name}</Link>
            <ul className="list-inside list-disc pl-6">
              {children.map(({ id, name }) => (
                <li key={id}>
                  <Link href={`/dashboard/bookmark-lists/${id}`}>{name}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
