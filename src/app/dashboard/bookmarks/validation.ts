import { z } from "zod";

export const createBookmarkSchema = z.object({
  url: z.string().url(),
});
