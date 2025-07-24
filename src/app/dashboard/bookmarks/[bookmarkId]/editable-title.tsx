"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { Form, FormControl, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { updateTitleAction } from "./actions";
import { updateTitleSchema } from "./validation";

export const EditableTitle = ({
  bookmarkId,
  title,
}: {
  bookmarkId: string;
  title: string;
}) => {
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  const boundUpdateTitleAction = updateTitleAction.bind(null, bookmarkId);
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormOptimisticAction(
      boundUpdateTitleAction,
      zodResolver(updateTitleSchema),
      {
        actionProps: {
          currentState: { title },
          onExecute: () => {
            setEdit(false);
            h1Ref.current?.focus();
          },
          updateFn: (state, input) => {
            return {
              title: input.title,
            };
          },
          onSuccess: () => {
            toast.success("Title updated");
          },
        },
        formProps: {
          mode: "onChange",
          defaultValues: {
            title,
          },
        },
      },
    );
  const {
    formState: { isDirty, isValid },
  } = form;

  return edit ? (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormControl>
              <Input
                {...field}
                ref={inputRef}
                placeholder="Bookmark Title"
                className="h-10"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    flushSync(() => setEdit(false));
                    h1Ref.current?.focus();
                  }
                }}
                onBlur={async ({ target }) => {
                  if (isDirty && isValid) {
                    form.reset({ title: target.value });
                    await handleSubmitWithAction();
                  } else {
                    resetFormAndAction();
                    setEdit(false);
                  }
                }}
              />
            </FormControl>
          )}
        />
      </form>
    </Form>
  ) : (
    <h1
      className="text-3xl font-medium"
      ref={h1Ref}
      onClick={() => {
        flushSync(() => {
          setEdit(true);
        });
        inputRef.current?.select();
      }}
    >
      {action.optimisticState.title}
    </h1>
  );
};
