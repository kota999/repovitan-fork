import { z } from "zod";

export const updateQuadrantTitleSchema = z.object({
  title: z.string().min(1),
});

export const bindEditQuadrantTitleSchemas: [quadrantId: z.ZodString] = [
  z.string().min(1),
];
