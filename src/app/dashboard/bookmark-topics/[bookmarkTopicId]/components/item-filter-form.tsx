"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const FormSchema = z.object({
  itemfilter: z.string().min(0, {
    message: "Filter keyword must be at least 2 characters.",
  }),
});

interface FormProps {
  itemFilterKeyword: string;
  handleInputChange: (newValue: string) => void;
}

export function ItemFilterForm({ handleInputChange }: FormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      itemfilter: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const { itemfilter } = data;
    handleInputChange(itemfilter);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="itemfilter"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="search" placeholder="filter item..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
