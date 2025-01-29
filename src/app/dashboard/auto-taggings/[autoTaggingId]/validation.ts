import { z } from "zod";

export const bindCreateAutoTagKeywordArgsSchemas: [autoTagId: z.ZodString] = [
  z.string().min(1),
];
export const createAutoTagKeywordSchema = z.object({
  keyword: z.string().min(3),
});
