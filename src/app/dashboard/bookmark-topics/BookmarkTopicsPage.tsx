import Link from "next/link";
import { CreateBookmarkTopicForm } from "./create-bookmark-topic-form";
import { getBookmarkTopics } from "~/db/query";

export const dynamic = "force-dynamic";

export default async function BookmarkTopicsPage({
  share = false,
}: {
  share?: boolean;
}) {
  const bookmarkTopics = await getBookmarkTopics();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {!share && <CreateBookmarkTopicForm />}
      <ul className="list-inside list-disc">
        {bookmarkTopics.map(({ id, name }) => (
          <li key={id}>
            {share ? (
              <Link href={`/share/bookmark-topics/${id}`}>{name}</Link>
            ) : (
              <Link href={`/dashboard/bookmark-topics/${id}`}>{name}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
