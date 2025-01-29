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
import { createAutoTagKeywordAction } from "./actions";
import { createAutoTagKeywordSchema } from "./validation";

type Props = {
  autoTagId: string;
};

export function CreateAutoTagKeywordForm({ autoTagId }: Props) {
  const bindCreateAutoTagKeywordAction = createAutoTagKeywordAction.bind(
    null,
    autoTagId,
  );
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      bindCreateAutoTagKeywordAction,
      zodResolver(createAutoTagKeywordSchema),
      {
        actionProps: {
          onSuccess: ({ data }) => {
            resetFormAndAction();
            if (data?.successful) {
              toast.success("Auto-Tagging Keyword added");
            }
          },
          onError: ({ error: { validationErrors, serverError } }) => {
            const description =
              validationErrors?.keyword?._errors?.[0] ?? serverError;
            toast.error("Failed to add Auto-Tagging Keyword", {
              description,
            });
          },
        },
        formProps: {
          mode: "onChange",
          defaultValues: {
            keyword: "",
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
            name="keyword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Auto Tag Keyword</FormLabel>
                <FormControl>
                  <div className="flex max-w-lg items-center gap-2">
                    <Input
                      {...field}
                      id="keyword"
                      placeholder="keyword"
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
    </>
  );
}
