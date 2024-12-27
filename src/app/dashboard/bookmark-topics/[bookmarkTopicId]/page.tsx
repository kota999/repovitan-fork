import { notFound } from "next/navigation";
import { db } from "~/db";

export default async function BookmarkTopicPage({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { bookmarkTopicId } = await params;
  const bookmarkTopic = await db.query.bookmarkTopicsTable.findFirst({
    where: (bookmarkTopicsTable, { eq }) =>
      eq(bookmarkTopicsTable.id, bookmarkTopicId),
  });

  if (!bookmarkTopic) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{bookmarkTopic.name}</div>
    </div>
  );
}
