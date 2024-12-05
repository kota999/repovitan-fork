import { z } from "zod";

export const createBookmarkListSchema = z.object({
  name: z.string().min(1),
});
