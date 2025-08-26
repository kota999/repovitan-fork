import BookmarkTopicPage from "~/app/dashboard/bookmark-topics/[bookmarkTopicId]/BookmarkTopicPage";

export default async function Page({
  params,
}: {
  params: Promise<{ bookmarkTopicId: string }>;
}) {
  const { bookmarkTopicId } = await params;
  return (
    <BookmarkTopicPage
      params={{ bookmarkTopicId: bookmarkTopicId, share: true }}
    />
  );
}
