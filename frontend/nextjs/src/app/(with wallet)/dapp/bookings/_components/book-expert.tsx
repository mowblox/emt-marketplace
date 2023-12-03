"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import ExpertHubCard from '@/components/ui/expert-hub-card'
import { ExpertTicket } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Globe2Icon } from 'lucide-react'



const FormSchema = z.object({
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
})

export function BookingCalendarForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    const currentTimezone = "UTC Time (10:00)"

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Select Date &amp; Time</FormLabel>
                            <Calendar
                                mode="single"
                                className='border rounded-md p-3'
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="">
                    <div className="text-sm mb-2">Saturday, November 25</div>
                    <div className="text-xs text-muted flex items-center">
                        <Button variant="outline" className="text-xs w-[200px]">13:00</Button>
                    </div>
                </div>

                <div className="">
                    <div className="text-sm mb-2">Time Zone</div>
                    <div className="text-xs text-muted flex items-center">
                        <Globe2Icon className='w-4 h-4 mr-2' /> {currentTimezone} 
                        <Button variant="ghost" className="text-xs hover:bg-transparent text-accent-3 hover:text-accent-4">Update</Button>
                    </div>
                </div>
                <div className="w-full flex justify-end">
                    <Button type="submit" className='w-[160px]'>Continue</Button>
                </div>
            </form>
        </Form>
    )
}

type Props = {
    ownedExpt: ExpertTicket[]
}

const BookExpert = ({ ownedExpt }: Props) => {
    return (
        <>
            <div className="w-full flex flex-wrap gap-4 flex-grow">
                {ownedExpt.map((expert, key) => {
                    const { author, metadata } = expert
                    return <>
                        <Dialog key={`expertsss-${key}-${author.uid}`}>
                            <DialogTrigger>
                                <ExpertHubCard data={expert} type="modal" />
                            </DialogTrigger>

                            <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                                <div className="grid grid-cols-[35%_60%]">
                                    <ScrollArea className="h-full">
                                        <div className="border-r pr-6 py-6">
                                            <DialogHeader className='mb-6'>
                                                <DialogTitle>Book a Session with {author.displayName}</DialogTitle>
                                            </DialogHeader>
                                            <ExpertHubCard data={expert} disableLink={true} />
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Session Duration</div>
                                                <div className="text-xs text-muted">{metadata.sessionCount} session(s) x {metadata.sessionDuration} minutes</div>
                                            </div>

                                            <div className="">
                                                <div className="text-sm mb-2">Description</div>
                                                <div className="text-xs text-muted">{metadata.description}</div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <div className="p-6">
                                        <ScrollArea className='h-full'>
                                            <BookingCalendarForm />
                                        </ScrollArea>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                })}
            </div>
        </>
    )
}

export default BookExpert