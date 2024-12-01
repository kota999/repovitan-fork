import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "~/components/ui/separator";
import { db } from "~/db";
import { EditableTitle } from "./editable-title";

export default async function BookmarkPage({
  params,
}: {
  params: Promise<{ bookmarkId: string }>;
}) {
  const { bookmarkId } = await params;
  const bookmark = await db.query.bookmarksTable.findFirst({
    where: (bookmarks, { eq }) => eq(bookmarks.id, bookmarkId),
    with: {
      link: true,
    },
  });

  if (!bookmark) {
    return notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4">
        <EditableTitle bookmarkId={bookmarkId} title={bookmark.title ?? ""} />
        {bookmark.link.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.link.imageUrl}
            alt={bookmark.link.title ?? ""}
            className="w-full max-w-lg rounded-lg border"
          />
        )}
        <p>{bookmark.link.title}</p>
        <p>{bookmark.link.description}</p>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookmark.link.favicon ?? ""} alt="" className="size-5" />
          <Link href={bookmark.link.url} target="_blank">
            {bookmark.link.url}
          </Link>
        </div>
      </div>
      <Separator />
    </div>
  );
}
