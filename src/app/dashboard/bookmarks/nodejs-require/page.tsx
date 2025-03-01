import { db } from "~/db";
import { CreateNodejsRequireForm } from "./create-nodejs-require-form";
import { auth } from "@clerk/nextjs/server";
import { NodejsRequirePackageItem } from "./nodejs-require-package-item";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const requirePackages =
    await db.query.nodejsProjectRequirePackageTable.findMany({
      where: (nodejsProjectRequirePackageTable, { eq }) =>
        eq(nodejsProjectRequirePackageTable.userId, userId),
    });
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <CreateNodejsRequireForm />
      <span>
        {'Default (require package record is none) Package is "next"'}
      </span>
      <ul className="list-inside list-disc">
        {requirePackages.map(({ id, packageName }) => (
          <li key={id}>
            <NodejsRequirePackageItem id={id} packageName={packageName} />
          </li>
        ))}
      </ul>
    </div>
  );
}
