import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-8 py-4 pt-0">
      <Link href="/share/bookmarks">Go to &quot;/share/bookmarks/&quot;</Link>
      <Link href="/share/bookmark-topics">
        Go to &quot;/share/bookmark-topics/&quot;
      </Link>
      <Link href="/dashboard/">Go to &quot;Login Page&quot;</Link>
    </div>
  );
}
