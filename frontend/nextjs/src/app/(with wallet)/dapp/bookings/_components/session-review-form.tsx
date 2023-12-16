"use client";
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertTriangleIcon, } from 'lucide-react';
import React from 'react'
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import Rating from '@/components/ui/rating';

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

  const onSubmit = () => {
    console.log('submits', form.getValues())
  }
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
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Rating {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
    
              <div className="flex justify-start w-full">
                <Button type="submit" variant="default" className="w-full md:w-[160px] ">
                  Submit Review
                </Button>
              </div>

              <div className="w-full flex flex-col md:flex-row md:items-center text-sm">
                <div className="flex items-center mr-2">
                  <AlertTriangleIcon className='w-4 h-4 mr-2 text-accent-4'/>
                  Send a report if the session did not hold. 
                </div>
                <Link href={`mailto:${REPORT_EMAIL}`} className='text-accent-3 hover:text-accent-4'>Send report</Link>
              </div>
            </form>
          </Form>
        </div>
      );
}

export default SessionReviewForm