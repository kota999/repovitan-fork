import { db } from "~/db";
import { CreateBookmarkForm } from "./create-bookmark-form";

export const dynamic = "force-dynamic";

export default async function Page() {
  const bookmarks = await db.query.bookmarksTable.findMany();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkForm bookmarks={bookmarks} />
    </div>
  );
}
