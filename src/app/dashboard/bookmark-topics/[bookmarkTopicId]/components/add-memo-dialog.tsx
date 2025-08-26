"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SquarePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { createTopicMemoAction } from "../actions";
import { toast } from "sonner";

const FormSchema = z.object({
  memo: z
    .string()
    .min(10, {
      message: "Bio must be at least 10 characters.",
    })
    .max(160, {
      message: "Bio must not be longer than 160 characters.",
    }),
});

interface DialogProps {
  topicId: string;
  addMemoState: (topicId: string, memo: string) => void;
  share?: boolean;
}

export function AddMemoDialog({
  topicId,
  addMemoState,
  share = false,
}: DialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    startTransition(async () => {
      const result = await createTopicMemoAction({
        topicId: topicId,
        memo: data.memo,
      });
      if (result.successful) {
        addMemoState(result.memoId, data.memo);
        toast.success("Memo for bookmark topic added");
      }
      setOpen(false);
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {!share && (
          <Button
            variant="outline"
            className="w-auto px-2 text-justify text-primary/100"
          >
            <SquarePlus />
            Add Memo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Add Memo</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write notes for bookmarks in this topics."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write notes for bookmarks in this topics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
