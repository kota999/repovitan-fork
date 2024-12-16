import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/db";

export default async function NpmPackagePage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const npmPackage = await db.query.npmPackagesTable.findFirst({
    where: (packages, { eq }) => eq(packages.id, packageId),
    with: {
      projectsToPackages: {
        with: {
          project: {
            with: {
              repo: true,
            },
          },
        },
      },
    },
  });

  if (!npmPackage) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1>{npmPackage.name}</h1>
      <ul>
        {npmPackage.projectsToPackages.map(({ project }) => (
          <li key={project.id}>
            <h2>
              <Link href={project.htmlUrl} target="_blank">
                {project.repo.fullName}
              </Link>
            </h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
