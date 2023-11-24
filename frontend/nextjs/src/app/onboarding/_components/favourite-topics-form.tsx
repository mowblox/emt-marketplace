"use client"
import React from 'react'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {isValidFileType, profilePlaceholderImage} from "@/lib/utils"
import { useRouter } from 'next/navigation'

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
import Image from 'next/image'
import { Plus } from 'lucide-react'

const formSchema = z.object({
    tags: z.any()
})

const FavouriteTopicsForm = () => {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tags: ""
        },
    })
    const { toast } = useToast()

    const handleFileUpload = (file: File) => {
        // Handle the uploaded file here
        // You can perform validation, processing, etc.
        console.log('Uploaded profile image:', file);
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        toast({
            title: "Profile created!",
            variant: "success",
        })
        router.push("/onboarding/3")
    }

  return (
    <>
       <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <div className='flex gap-3 flex-wrap w-full'>
                                        {['blockchain', 'UX design','blockchain', 'UX design','blockchain', 'UX design'].map((tag, key) => (
                                            <Button key={`skills-tags-${key}`} className='rounded-full text-sm ' size="sm" variant="outline">
                                                {tag}
                                                <Plus className='w-4 h-4 text-muted ml-2' />
                                            </Button>)
                                        )}
                                    </div>
                                   
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end w-full">
                        <Button variant='outline' className='w-[160px] mr-3'>Back</Button>
                        <Button type="submit" variant='default' className='w-[160px] '>Next</Button>
                    </div>
                </form>
            </Form>
    </>
  )
}

export default FavouriteTopicsForm