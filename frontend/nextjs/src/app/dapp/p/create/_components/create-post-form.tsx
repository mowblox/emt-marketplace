"use client"
import React from 'react'
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const CreatePostForm = () => {
    const formSchema = z.object({
        username: z.string().min(2).max(50),
    })
    return (
        <div>CreatePostForm</div>
    )
}

export default CreatePostForm