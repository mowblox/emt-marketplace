"use client"
import React from 'react'
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


const formSchema = z.object({
    postTitle: z.string().min(1, {
        message: "Title can't be empty",
    }),
    postBody: z.string(),
    coverPhoto: z.string().refine((value) => isValidFileType(value), {
        message: 'Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.',
    }),
})

const CreatePostForm = () => {
    const { createPost } = useBackend()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            postTitle: "",
            postBody: "",
        },
    })
    const imageRef = React.useRef<HTMLInputElement>(null);
    
    const { toast } = useToast()


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const image = imageRef.current?.files![0];
        const {id, imageURL} = await createPost({title: values.postTitle, body: values.postBody, image})


        toast({
            title: "Post published!",
            variant: "success",
        })
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

                                        <Input placeholder="Upload photo" className='mb-4' type='file' {...field} ref= {imageRef}  />
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
                    <div className="flex justify-end w-full">
                        <Button type="submit" variant='gradient' className='w-[160px] '>Post</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreatePostForm