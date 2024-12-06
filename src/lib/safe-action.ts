import { auth } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);

    return e.message;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return next({ ctx: { userId } });
});
