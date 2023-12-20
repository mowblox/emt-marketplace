"use client";
import React, { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";
import useBackend from "@/lib/hooks/useBackend";
import { isValidFileType, placeholderImage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  HOME_PAGE,
  POST_PAGE,
} from "@/app/(with wallet)/_components/page-links";


const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  description: z.string(),
});

const SubmitARequestForm = () => {
  const { submitRequest } = useBackend();
  const { data, mutateAsync } = useMutation({
    mutationFn: (variables: {
      email: string;
      description: string;
    }) => submitRequest(variables),
  });
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      description: "",
    },
  });
  const [isFormLoading, setIsFormLoading] = useState(false);

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsFormLoading(true);
    try {
      await mutateAsync({
        email: values.email,
        description: values.description,
      });
      router.push(POST_PAGE(''));
      setIsFormLoading(false);
    } catch (error: any) {
      console.error(error.message);
      setIsFormLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-muted font-normal" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description<span className="text-xs text-muted ml-2">Required</span></FormLabel>
                <FormControl>
                  <RichTextEditor
                    placeholder="Please enter details of your request"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end w-full gap-4">
            <Button
              onClick={() => {
                router.push(HOME_PAGE);
              }}
              variant="outline"
              className="w-full md:w-[160px] ">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isFormLoading}
              loadingText="Creating post"
              disabled={isFormLoading || !form.formState.isValid}
              variant="default"
              className="w-full md:w-[160px]">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubmitARequestForm;
