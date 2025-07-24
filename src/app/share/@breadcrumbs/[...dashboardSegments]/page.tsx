import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

type Props = {
  params: Promise<{
    dashboardSegments: string[];
  }>;
};

export default async function BreadcrumbsSlot({ params }: Props) {
  const { dashboardSegments } = await params;
  const breadcrumbPage = dashboardSegments.pop();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {dashboardSegments.map((segment, idx) => {
          const parentSegments = dashboardSegments.slice(0, idx);
          const parentPath =
            parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "";
          const href = `${parentPath}/${segment}`;

          return (
            <Fragment key={href}>
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    className="capitalize transition-colors hover:text-foreground"
                    href={href}
                  >
                    {segment}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          );
        })}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize">
            {breadcrumbPage}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
