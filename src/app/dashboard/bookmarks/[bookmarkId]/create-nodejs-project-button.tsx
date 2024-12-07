"use client";

import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Form from "next/form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { createNodejsProjectAction } from "./actions";

// https://nextjs.org/docs/app/api-reference/components/form
export function CreateNodejsProjectButton({
  bookmarkId,
  url,
}: {
  bookmarkId: string;
  url: string;
}) {
  const bindCreateNodejsProjectAction = createNodejsProjectAction.bind(
    null,
    bookmarkId,
    url,
  );
  const { executeAsync, isPending } = useAction(bindCreateNodejsProjectAction, {
    onSuccess() {
      toast.success("Node.js project created");
    },
    onError({ error }) {
      toast.error(error.serverError);
    },
  });

  return (
    <div className="grid gap-4">
      <Form
        action={async () => {
          await executeAsync();
        }}
      >
        <Button type="submit">
          <Loader2Icon
            className={cn(
              "absolute animate-spin",
              !isPending && "text-transparent",
            )}
          />
          <span className={cn(isPending && "text-transparent")}>
            Node.js Project
          </span>
        </Button>
      </Form>
    </div>
  );
}
