"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
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
import { cn } from "~/lib/utils";
import { createBookmarkTagAction } from "./actions";
import { createBookmarkTagSchema } from "./validation";

type Props = {
  tags: {
    id: string;
    name: string;
  }[];
};

export function CreateBookmarkTagForm({ tags }: Props) {
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormOptimisticAction(
      createBookmarkTagAction,
      zodResolver(createBookmarkTagSchema),
      {
        actionProps: {
          currentState: { tags },
          updateFn: (state, input) => {
            return {
              tags: [
                {
                  id: "temp-id",
                  name: input.name,
                },
                ...state.tags,
              ],
            };
          },
          onSuccess: ({ data }) => {
            resetFormAndAction();
            if (data?.successful) {
              toast.success("Bookmark Tag added");
            }
          },
          onError: ({ error: { validationErrors, serverError } }) => {
            const description =
              validationErrors?.name?._errors?.[0] ?? serverError;
            toast.error("Failed to add bookmark tag", {
              description,
            });
          },
        },
        formProps: {
          mode: "onChange",
          defaultValues: {
            name: "",
          },
        },
      },
    );
  const {
    formState: { isDirty, isValid },
  } = form;

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmitWithAction} className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Tag</FormLabel>
                <FormControl>
                  <div className="flex max-w-lg items-center gap-2">
                    <Input
                      {...field}
                      id="name"
                      placeholder="tag"
                      autoComplete="off"
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
      <ul className="list-inside list-disc">
        {action.optimisticState.tags.map(({ id, name }) => (
          <li key={id}>
            <Link href={`/dashboard/bookmark-tags/${id}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
