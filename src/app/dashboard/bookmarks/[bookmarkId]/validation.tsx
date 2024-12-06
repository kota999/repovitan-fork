import { z } from "zod";

export const bindArgsSchemas: [bookmarkId: z.ZodString] = [z.string().min(1)];

export const updateTitleSchema = z.object({
  title: z.string().min(1),
});

export const updateTagsSchema = z.object({
  tagNames: z.array(z.string()),
});
