import { z } from "zod";

export const createNodejsRequirePackageSchema = z.object({
  packageName: z.string().min(1),
});

export const deleteNodejsRequirePackageSchema = z.object({
  packageId: z.string().min(1),
});
