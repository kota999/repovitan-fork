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

export default async function Page() {
  const bookmarks = await db.query.bookmarksTable.findMany({
    orderBy: (bookmarksTable, { desc }) => [desc(bookmarksTable.updatedAt)],
    with: {
      link: true,
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkForm />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:flex 2xl:flex-wrap">
        {bookmarks.map(({ id, title, link: { imageUrl } }) => (
          <li key={id}>
            <MinimalCard className="2xl:w-96">
              <MinimalCardImage src={imageUrl ?? ""} alt={title ?? ""} />
              <MinimalCardTitle className="line-clamp-3">
                <Link href={`/dashboard/bookmarks/${id}`}>{title}</Link>
              </MinimalCardTitle>
              <MinimalCardDescription></MinimalCardDescription>
            </MinimalCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
