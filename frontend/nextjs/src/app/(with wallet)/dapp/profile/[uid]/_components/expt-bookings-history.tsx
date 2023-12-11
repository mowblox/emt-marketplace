"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import ExpertHubCard from '@/components/ui/expert-hub-card'
import { ExpertTicket, ExptListingWithAuthorProfile } from '@/lib/types'
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
import { Textarea } from '@/components/ui/textarea'
import SessionReviewForm from '../../../bookings/_components/session-review-form'



const FormSchema = z.object({
    availableDate: z.date({
        required_error: "A date is required.",
    }),
    message: z.string().optional()
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
                // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                // {/* </pre> */}
            ),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="availableDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Select Date &amp; Time</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[200px] pl-3 text-center text-foreground font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        className='bg-accent-shade rounded-md p-3'
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message (optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Share anything that might help the mentor prepare for the meeting" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs text-muted font-normal" />
                        </FormItem>
                    )}
                />

                <div className="">
                    <div className="text-sm mb-2">Time Zone</div>
                    <div className="text-xs text-muted flex items-center">
                        <Globe2Icon className='w-4 h-4 mr-2' /> {currentTimezone}
                        <Button variant="ghost" className="text-xs hover:bg-transparent text-accent-3 hover:text-accent-4">Update</Button>
                    </div>
                </div>
                <div className="w-full flex justify-end mb-[240px]">
                    <Button type="submit" className='w-[160px]'>Book Session</Button>
                </div>
            </form>
        </Form>
    )
}

type Props = {
    ownedExpt: ExptListingWithAuthorProfile[]
}

const ExptBookingsHistory = ({ ownedExpt }: Props) => {
    return (
        <>
            <div className="w-full flex flex-wrap gap-4 flex-grow">
                {ownedExpt.map((expert, key) => {
                    return <>
                        <Dialog key={`book-modal-${key}-${expert.authorProfile.uid}`}>
                            <DialogTrigger>
                                <ExpertHubCard data={expert} type="modal" />
                            </DialogTrigger>

                            <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                                <div className="grid grid-cols-1 md:grid-cols-[35%_60%]">
                                    <ScrollArea className="hidden md:block h-[90vh]">
                                        <div className="border-r pr-6 py-6">
                                            <DialogHeader className='mb-6'>
                                                <DialogTitle>Token Id: <span className='text-muted font-normal'>EXPT002</span></DialogTitle>
                                            </DialogHeader>
                                            <ExpertHubCard data={expert} disableLink={true} />
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Session Duration</div>
                                                <div className="text-xs text-muted">{expert.sessionCount} session(s) x {expert.sessionDuration} minutes</div>
                                            </div>

                                            <div className="">
                                                <div className="text-sm mb-2">Description</div>
                                                <div className="text-xs text-muted">{expert.description}</div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <ScrollArea className='h-[90vh] pt-6 md:p-6'>
                                        <SessionReviewForm />
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                })}
            </div>
        </>
    )
}

export default ExptBookingsHistory