import BookmarkTopicPage from "./BookmarkTopicPage";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { bookmarkTopicId } = await params;
  return <BookmarkTopicPage params={{ bookmarkTopicId, share: false }} />;
}
