import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { getSortingStateParser } from "~/lib/parsers";
import type { NpmPackage } from "./queries";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<NpmPackage>().withDefault([
    { id: "count", desc: true },
  ]),
  name: parseAsString.withDefault(""),
});

export type GetNpmPackagesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
