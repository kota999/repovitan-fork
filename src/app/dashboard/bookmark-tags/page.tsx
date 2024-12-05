import { db } from "~/db";
import { CreateBookmarkTagForm } from "./create-bookmark-tag-form";

export const dynamic = "force-dynamic";

export default async function BookmarkTagsPage() {
  const bookmarkTags = await db.query.bookmarkTagsTable.findMany({
    orderBy: (bookmarkTagsTable, { desc }) => [
      desc(bookmarkTagsTable.updatedAt),
    ],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkTagForm tags={bookmarkTags} />
    </div>
  );
}
