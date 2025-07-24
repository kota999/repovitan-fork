import BookmarkPage from "./bookmarkId";

export default async function Page({
  params,
}: {
  params: Promise<{ bookmarkId: string }>;
}) {
  const { bookmarkId } = await params;
  return <BookmarkPage bookmarkId={bookmarkId} />;
}
