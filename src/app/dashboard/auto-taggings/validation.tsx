import { z } from "zod";

export const updateAutoTagsSchema = z.object({
  tagNames: z.array(z.string()),
});
