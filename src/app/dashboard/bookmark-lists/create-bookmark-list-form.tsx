"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
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
import { cn } from "~/lib/utils";
import { createBookmarkListAction } from "./actions";
import { createBookmarkListSchema } from "./validation";

export function CreateBookmarkListForm() {
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      createBookmarkListAction,
      zodResolver(createBookmarkListSchema),
      {
        actionProps: {
          onSuccess: ({ data }) => {
            resetFormAndAction();
            if (data?.successful) {
              toast.success("Bookmark List added");
            }
          },
          onError: ({ error: { validationErrors, serverError } }) => {
            const description =
              validationErrors?.name?._errors?.[0] ?? serverError;
            toast.error("Failed to add bookmark list", {
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
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="grid gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">List</FormLabel>
              <FormControl>
                <div className="flex max-w-lg items-center gap-2">
                  <Input
                    {...field}
                    id="name"
                    placeholder="List Name"
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
  );
}
