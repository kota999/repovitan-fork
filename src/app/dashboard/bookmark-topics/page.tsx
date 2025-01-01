import Link from "next/link";
import { CreateBookmarkTopicForm } from "./create-bookmark-topic-form";
import { getBookmarkTopics } from "~/db/query";

export const dynamic = "force-dynamic";

export default async function BookmarkTopicsPage() {
  const bookmarkTopics = await getBookmarkTopics();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateBookmarkTopicForm />
      <ul className="list-inside list-disc">
        {bookmarkTopics.map(({ id, name }) => (
          <li key={id}>
            <Link href={`/dashboard/bookmark-topics/${id}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
