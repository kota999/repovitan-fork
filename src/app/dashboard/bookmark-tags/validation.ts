import { z } from "zod";

export const createBookmarkTagSchema = z.object({
  name: z.string().min(1),
});
