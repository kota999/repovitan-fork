"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "~/components/extension/multi-select";
import { Button } from "~/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { updateTagsAction } from "./actions";
import { updateTagsSchema } from "./validation";

export const MultiSelectTags = ({
  bookmarkId,
  tags,
  bookmarkTags,
}: {
  bookmarkId: string;
  tags: {
    id: string;
    name: string;
  }[];
  bookmarkTags: {
    id: string;
    name: string;
  }[];
}) => {
  const bindUpdateTagsAction = updateTagsAction.bind(null, bookmarkId);
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    bindUpdateTagsAction,
    zodResolver(updateTagsSchema),
    {
      actionProps: {
        onSuccess: ({ data, input: { tagNames } }) => {
          if (data?.successful) {
            form.reset({ tagNames });
            action.reset();
            toast.success("Tag added");
          }
        },
        onError: ({ error: { serverError } }) => {
          const description = serverError;
          toast.error("Failed to add bookmark list", {
            description,
          });
        },
      },
      formProps: {
        mode: "onChange",
        defaultValues: {
          tagNames: tags.map(({ name }) => name),
        },
      },
    },
  );
  const {
    formState: { isDirty, isValid },
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction}>
        <FormField
          control={form.control}
          name="tagNames"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Add Tags</FormLabel>
              <MultiSelector
                onValuesChange={field.onChange}
                values={field.value}
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {bookmarkTags.map(({ id, name }) => (
                      <MultiSelectorItem key={id} value={name}>
                        <span>{name}</span>
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!isDirty || !isValid || action.isPending}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};
