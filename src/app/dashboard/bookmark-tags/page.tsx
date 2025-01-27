import { CreateBookmarkTagForm } from "./create-bookmark-tag-form";
import { getBookmarkTags } from "~/db/query";

export const dynamic = "force-dynamic";

export default async function BookmarkTagsPage() {
  const bookmarkTags = await getBookmarkTags();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkTagForm tags={bookmarkTags} />
    </div>
  );
}
