import BookmarkPage from "../../../dashboard/bookmarks/[bookmarkId]/bookmarkId";

export default async function Page({
  params,
}: {
  params: Promise<{ bookmarkId: string }>;
}) {
  const { bookmarkId } = await params;
  return <BookmarkPage bookmarkId={bookmarkId} share={true} />;
}
