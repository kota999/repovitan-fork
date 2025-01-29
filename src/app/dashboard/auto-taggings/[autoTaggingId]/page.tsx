import { notFound } from "next/navigation";
import { db } from "~/db";
import { CreateAutoTagKeywordForm } from "./create-auto-tag-keyword-form";

export default async function AutoTagPage({
  params,
}: {
  params: Promise<{ autoTaggingId: string }>;
}) {
  const { autoTaggingId } = await params;
  const autoTag = await db.query.autoTagsForNpmPackagesTable.findFirst({
    where: (autoTagsForNpmPackagesTable, { eq }) =>
      eq(autoTagsForNpmPackagesTable.id, autoTaggingId),
    with: {
      tag: true,
      keyword: true,
    },
  });

  if (!autoTag) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-xl font-bold">{autoTag.tag.name}</div>
      <CreateAutoTagKeywordForm autoTagId={autoTaggingId} />
      <div>keywords</div>
      <ul className="list-inside list-disc">
        {autoTag.keyword.map(({ keyword }) => (
          <li key={keyword}>{keyword}</li>
        ))}
      </ul>
    </div>
  );
}
