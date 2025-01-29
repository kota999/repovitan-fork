import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getAutoTags, getBookmarkTags } from "~/db/query";
import { MultiSelectTags } from "./multi-select-tags";

export const dynamic = "force-dynamic";

export default async function AutoTagsPage() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const autoTags = await getAutoTags(userId);
  const bookmarkTags = await getBookmarkTags();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <div>
          <MultiSelectTags
            tags={autoTags.map(({ tag: { id, name } }) => ({
              id,
              name,
            }))}
            bookmarkTags={bookmarkTags}
          />
        </div>
      </div>
      {/* list for settings of auto tagging tags */}
      <div>
        <ul className="list-inside list-disc">
          {autoTags.map(({ id, tag: { name } }) => (
            <li key={id}>
              <Link href={`/dashboard/auto-taggings/${id}`}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
