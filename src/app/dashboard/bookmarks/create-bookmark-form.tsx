"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { Bookmark } from "~/db/schema";
import { cn } from "~/lib/utils";
import { createBookmarkAction } from "./actions";
import { createBookmarkSchema } from "./validation";

type Props = {
  bookmarks: Pick<Bookmark, "id" | "url">[];
};

export function CreateBookmarkForm({ bookmarks }: Props) {
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormOptimisticAction(
      createBookmarkAction,
      zodResolver(createBookmarkSchema),
      {
        actionProps: {
          currentState: { bookmarks },
          updateFn: (state, input) => {
            return {
              bookmarks: [
                ...state.bookmarks,
                { ...input, id: Math.random().toString() },
              ],
            };
          },
          onSuccess: ({ data }) => {
            form.reset();
            if (data) {
              const {
                bookmark: { url },
              } = data;
              toast.success("Bookmark has been added", {
                description: url,
              });
            }
          },
          onError: ({ error: { validationErrors, serverError } }) => {
            const description =
              validationErrors?.url?._errors?.[0] ?? serverError;
            toast.error("Failed to add bookmark", {
              description,
            });
          },
        },
        formProps: {
          mode: "onChange",
          defaultValues: {
            url: "",
          },
        },
      },
    );
  const {
    formState: { isDirty, isValid },
  } = form;

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="grid gap-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="url">Bookmark</FormLabel>
                <FormControl>
                  <div className="flex max-w-lg items-center gap-2">
                    <Input
                      {...field}
                      id="url"
                      placeholder="Save a URL https://..."
                    />
                    <Button
                      type="submit"
                      disabled={!isDirty || !isValid || action.isPending}
                    >
                      <Loader2Icon
                        className={cn(
                          "absolute animate-spin",
                          !action.isPending && "text-transparent",
                        )}
                      />
                      <span
                        className={cn(action.isPending && "text-transparent")}
                      >
                        Add
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={resetFormAndAction}
            >
              Reset form and action state
            </Button>
          </div>
          {form.formState.errors.root ? (
            <p>{form.formState.errors.root.message}</p>
          ) : null}
        </form>
      </Form>
      <ul>
        {action.optimisticState.bookmarks.map(({ id, url }) => (
          <li key={id}>
            <p>{url}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
