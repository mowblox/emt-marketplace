"use client"
import React, { useState } from 'react'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import RichTextEditor from '@/components/ui/rich-text-editor'
import useBackend from '@/lib/hooks/useBackend'
import { isValidFileType, profilePlaceholderImage } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { HOME_PAGE, POST_PAGE } from '@/app/(with wallet)/_components/page-links'
import { TAGS } from "@/lib/contants";
import { Minus, Plus } from "lucide-react";


const formSchema = z.object({
    postTitle: z.string().min(1, {
        message: "Title can't be empty",
    }),
    postBody: z.string(),
    coverPhoto: z.string().refine((value) => isValidFileType(value), {
        message: 'Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.',
    }),
    tags: z.array(z.string()).optional(),
})

const CreatePostForm = () => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const { createPost } = useBackend();
    const { data, mutateAsync } = useMutation({
        mutationFn: (variables: { title: string, body: string, image: File }) => createPost(variables),
    })
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postTitle: "",
            postBody: "",
        },
    });
    const imageRef = React.useRef<HTMLInputElement>(null);
    const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

    const { toast } = useToast()


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsCreatePostLoading(true)
        const t = toast({
            title: "Publishing post...",
            description: "Mining transaction...",
            duration: Infinity

        })
        const image = imageRef.current?.files![0] as File;
        try {
            const { id, imageURL } = await mutateAsync({ title: values.postTitle, body: values.postBody, image })
            router.push(POST_PAGE(id));
            t.update({
                id: t.id,
                title: "Post published!",
                variant: "success",
                duration: 1000,
            })
            setIsCreatePostLoading(false)
        } catch (error: any) {
            t.update({
                id: t.id,
                title: "Something went wrong",
                description: "Please wait a moment & try again",
                variant: "destructive",
                duration: 1000,
            })
            setIsCreatePostLoading(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <FormField
                        control={form.control}
                        name="coverPhoto"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl className='mb-3'>
                                    <>
                                        <div className="w-full h-20 relative">
                                            <Image
                                                src={imageRef.current?.files![0] ? URL.createObjectURL(imageRef.current?.files![0]) : profilePlaceholderImage}
                                                fill
                                                placeholder={profilePlaceholderImage}
                                                className='object-cover '
                                                alt={`Add a cover image`}
                                            />
                                        </div>

                                        <Input placeholder="Upload photo" className='mb-4' type='file' {...field} ref={imageRef} />
                                        <div className='mb-4'></div>
                                    </>
                                </FormControl>
                                <FormLabel >Cover Photo</FormLabel>
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
                                <FormMessage className='text-xs text-muted font-normal' />
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
                                    <RichTextEditor placeholder="Answer a question or explain a concept" {...field} />
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
                                        {TAGS.map((tag) => {
                                            const isSelected = selectedTags.includes(tag);
                                            const setTags = () =>
                                                setSelectedTags(
                                                    isSelected
                                                        ? selectedTags.filter(
                                                            (item: string) => item !== tag
                                                        )
                                                        : [...selectedTags, tag]
                                                );
                                            return (
                                                <Button
                                                    type="button"
                                                    onClick={setTags}
                                                    key={`skills-tags-${tag}`}
                                                    className="rounded-full text-sm "
                                                    size="sm"
                                                    variant={isSelected ? "default" : "outline"}>
                                                    {tag}
                                                    {isSelected ? (
                                                        <Minus className="w-4 h-4 text-muted ml-2" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-accent-2 ml-2" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end w-full gap-4">
                        <Button onClick={() => { router.push(HOME_PAGE); }} variant='outline' className='w-full md:w-[160px] '>Cancel</Button>
                        <Button type="submit" isLoading={isCreatePostLoading} loadingText='Creating post' disabled={isCreatePostLoading || !form.formState.isValid} variant='gradient' className='w-full md:w-[160px]'>Post</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreatePostForm