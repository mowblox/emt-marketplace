"use client"
import React, { useContext } from 'react'
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
import { toast, useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import { useUser } from '@/lib/hooks/user'
import useBackend from '@/lib/hooks/useBackend'
import { ONBOARDING_PAGE } from '../../_components/page-links'

const formSchema = z.object({
    displayName: z.string().min(1, {
        message: "Title can't be empty",
    }),
    username: z.string().min(4, {
        message: "That username is too short. Use atleast 4 characters"
    }),
    email: z.string().email({
        message: "Please enter a valid email address"
    }),
    profilePicture: z.string().optional().refine((value) =>value? isValidFileType(value) : true, {
        message: 'Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.',
    }),

})

const ProfileDetailsForm = () => {
    const {signUpData, validateSignUpData, session, signUp} = useUser()

    const imageRef = React.useRef<HTMLInputElement>(null);
    const { displayName, username,  email, profilePicture} = signUpData
    const image = imageRef.current?.files?.[0] || profilePicture 
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: displayName || "",
            username: username || "",
            email: email || "",
        },
    })

    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        //TODO: @Jovells change to loading toast
        const t = toast({
            variant: "default",
            title: "loading...",
            duration: Infinity,
        })

        console.log(values)
        signUpData.displayName = values.displayName;
        signUpData.username = values.username
        signUpData.email = values.email
        signUpData.profilePicture = image;

        const result = await validateSignUpData();
        console.log(result)
        let noErrors = true;
        if (!result.email) form.setError("email", {message: "This email is already taken"}), noErrors = false;
            
        if (!result.username) form.setError("username", {message: "This username is already taken"}), noErrors = false;
        
        if (noErrors){
            t.dismiss()
        router.push(ONBOARDING_PAGE(3))}
        else t.update({id: t.id, title: "Errors found", variant: "destructive", duration: 1000})

    }

  return (
    <>
       <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl className='mb-3'>
                                    <>
                                        <div className="w-20 h-20 rounded-full relative">
                                            <Image
                                                src={image ? URL.createObjectURL(image) : profilePlaceholderImage }
                                                fill
                                                placeholder={profilePlaceholderImage}
                                                className='object-cover rounded-full'
                                                alt={`Preview your profile picture`}
                                            />
                                        </div>

                                        <Input  placeholder="Upload photo" className='mb-4' type='file' {...field} ref = {imageRef} />
                                        <div className='mb-4'></div>
                                    </>
                                </FormControl>
                                <FormLabel >Profile Picture</FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage className='text-xs text-muted font-normal' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end w-full">
                        <Button onClick={()=>router.back()} variant='outline' className='w-[160px] mr-3'>Back</Button>
                        <Button type="submit" variant='default' className='w-[160px] '>Next</Button>
                    </div>
                </form>
            </Form>
    </>
  )
}

export default ProfileDetailsForm