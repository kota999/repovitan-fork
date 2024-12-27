import { z } from "zod";

export const createBookmarkTopicSchema = z.object({
  name: z.string().min(1),
});
