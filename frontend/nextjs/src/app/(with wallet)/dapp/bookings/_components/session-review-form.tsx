"use client";
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { profilePlaceholderImage } from '@/lib/utils';
import { profile } from 'console';
import { AlertTriangleIcon, Minus, Plus } from 'lucide-react';
import { Input } from 'postcss';
import React from 'react'
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const REPORT_EMAIL = 'mail@mail.com'

const formSchema = z.object({
  description: z
    .string()
    .optional(),
  rating: z
    .number()
    .min(1, {
      message: "That username is too short. Use atleast 4 characters",
    })
});

const SessionReviewForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = () => {}
    return (
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us how your session went</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your session" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-muted font-normal" />
                  </FormItem>
                )}
              />
    
    <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Set a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='w-full md:w-10"'>
                  <SelectItem value="1">1 star</SelectItem>
                  <SelectItem value="m@google.com">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
    
              <div className="flex justify-start w-full">
                <Button type="submit" variant="default" className="w-[160px] ">
                  Submit Review
                </Button>
              </div>

              <div className="w-full flex items-center text-xs">
                <AlertTriangleIcon className='w-4 h-4 mr-2'/>
                Send a report if the session did not hold. 
                <Link href={`mailto:${REPORT_EMAIL}`}>Send report</Link>
              </div>
            </form>
          </Form>
        </div>
      );
}

export default SessionReviewForm