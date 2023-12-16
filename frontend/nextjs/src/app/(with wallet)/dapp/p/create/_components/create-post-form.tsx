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
import { TAGS } from "@/lib/contants";
import { Minus, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const POST_TYPE = ["regular", "question", "answer"] as const;
const POST_TYPE_LABELS = [
  "Regular Post",
  "Ask a Question",
  "Provide an Answer",
] as const;

const formSchema = z.object({
  postTitle: z.string().min(1, {
    message: "Title can't be empty",
  }),
  postBody: z.string(),
  coverPhoto: z.string().refine((value) => isValidFileType(value), {
    message: "Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.",
  }),
  tags: z.array(z.string()).optional(), // not using this tags in the form schema
  postType: z.enum(POST_TYPE),
  questionPostURL: z.string().url("Must be a valid link").optional(),
});

const CreatePostForm = () => {
  const { createPost } = useBackend();
  const { data, mutateAsync } = useMutation({
    mutationFn: (variables: {
      title: string;
      body: string;
      image: File;
      postType: string;
      questionPostURL?: string;
      tags?: string[];
    }) => createPost(variables),
  });
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postTitle: "",
      postBody: "",
      postType: POST_TYPE[0],
    },
  });
  const imageRef = React.useRef<HTMLInputElement>(null);
  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const { toast } = useToast();

  function handleTags(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const tag = e.currentTarget.innerText;
    if (tags.includes(tag)) {
      setTags((old) => old.filter((t) => t !== tag));
    } else {
      setTags((old) => [...old, tag]);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreatePostLoading(true);

    const image = imageRef.current?.files![0] as File;
    try {
      const { id, imageURL } = await mutateAsync({
        title: values.postTitle,
        body: values.postBody,
        image,
        postType: values.postType,
        questionPostURL: values.questionPostURL ? values.questionPostURL : "",
        tags: tags ? tags : [""],
      });
      router.push(POST_PAGE(id));

      setIsCreatePostLoading(false);
    } catch (error: any) {
      console.error(error.message);
      setIsCreatePostLoading(false);
    }
  }

  console.log("erros", form.formState);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="postType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Number of sessions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POST_TYPE.map((el, key) => (
                      <SelectItem key={el} value={el}>
                        {POST_TYPE_LABELS[key]}{" "}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Only display the post type if you're answering a question */}
          {form.watch().postType == POST_TYPE[2] && (
            <FormField
              control={form.control}
              name="questionPostURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a link to the question you're answering"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-muted font-normal" />
                </FormItem>
              )}
            />
          )}

          <Separator />

          <FormField
            control={form.control}
            name="coverPhoto"
            render={({ field }) => (
              <FormItem>
                <FormControl className="mb-3">
                  <>
                    <div className="w-40 h-20 relative rounded-md">
                      <Image
                        src={
                          imageRef.current?.files![0]
                            ? URL.createObjectURL(imageRef.current?.files![0])
                            : placeholderImage
                        }
                        fill
                        placeholder={placeholderImage}
                        className="object-cover rounded-md "
                        alt={`Add a cover image`}
                      />
                    </div>

                    <Input
                      placeholder="Upload photo"
                      className="mb-4"
                      type="file"
                      {...field}
                      ref={imageRef}
                    />
                    <div className="mb-4"></div>
                  </>
                </FormControl>
                <FormLabel>Cover Photo</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Your post title" {...field} />
                </FormControl>
                <FormMessage className="text-xs text-muted font-normal" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <RichTextEditor
                    placeholder="Answer a question or explain a concept"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="flex gap-3 flex-wrap w-full">
                    {TAGS.map((tag) => (
                      <Button
                        onClick={handleTags}
                        key={`skills-tags-${tag}`}
                        className="rounded-full text-sm "
                        size="sm"
                        variant={tags!.includes(tag) ? "default" : "outline"}>
                        {tag}
                        {tags!.includes(tag) ? (
                          <Minus className="w-4 h-4 text-muted ml-2" />
                        ) : (
                          <Plus className="w-4 h-4 text-accent-2 ml-2" />
                        )}
                      </Button>
                    ))}
                  </div>
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
              isLoading={isCreatePostLoading}
              loadingText="Creating post"
              disabled={isCreatePostLoading || !form.formState.isValid}
              variant="gradient"
              className="w-full md:w-[160px]">
              Post
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreatePostForm;
