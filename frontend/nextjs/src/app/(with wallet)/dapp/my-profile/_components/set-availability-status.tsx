import { Button } from '@/components/ui/button'
import React, { useRef, useState, useEffect } from 'react'
import { HiOutlineTicket } from 'react-icons/hi2'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area'
import ExpertHubCard from '@/components/ui/expert-hub-card'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"
import { Globe2Icon } from 'lucide-react'
import { CalendarIcon } from "@radix-ui/react-icons"

import { Textarea } from '@/components/ui/textarea'
import { cn, isValidFileType } from "@/lib/utils"
import { ExpertTicket, ExptListing, NewExptListing, UserProfile } from '@/lib/types';
import Image from 'next/image'
import { placeholderImage } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useBackend from '@/lib/hooks/useBackend'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/user'
import { EXPERT_TICKET_PAGE } from '@/app/(with wallet)/_components/page-links'
import { serverTimestamp } from 'firebase/firestore'
import { Switch } from '@/components/ui/switch'
const PLACEHOLDER_COVER_PHOTO = require('@/assets/default-photo.png')


// Form Schema
const FormSchema = z.object({
    availableDate: z.date(),
    availableTime: z.string(),
});

// Component

const SetAvailabilityStatus = ({ profile }: any) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            availableDate: new Date(),
            availableTime: "",
        }
    })

    const [isListExptLoading, setIsListExptLoading] = useState(false)

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsListExptLoading(true)
        toast({
            title: "You submitted the following values:",
            description: (
                // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <div className="text-white">Availability saved</div>
                // {/* </pre> */}
            ),
        })
        setIsListExptLoading(false)
        form.reset()
    }
    return (
        <div className="mb-6 flex p-4 flex-col gap-6 md:gap-0 md:flex-row items-center justify-between bg-accent-shade rounded-md">
            <div className="flex p-4 items-center justify-between bg-accent-shade rounded-md">
                <div className="flex items-center mr-3">
                    <div className="flex items-center text-sm">
                        <div className="ml-1 flex items-center text-muted">Are you available for mentoring?</div>
                    </div>
                </div>
                <Switch />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Dialog>
                    <DialogTrigger>
                        <Button size="sm" variant="ghost" className="w-full md:w-auto px-5">Set Available Dates</Button>
                    </DialogTrigger>

                    <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                        <div className="grid grid-cols-1 md:grid-cols-[35%_60%]">
                            <ScrollArea className="hidden md:block h-[90vh]">
                                <div className="border-r h-screen pr-6 py-6">
                                    <DialogHeader className='mb-6'>
                                        <DialogTitle>Set Availability</DialogTitle>
                                    </DialogHeader>
                                </div>
                            </ScrollArea>
                            <ScrollArea className='h-[90vh] pt-6 md:p-6'>
                                <>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                            <div className="">
                                                <h4 className="text-md text-foreground font-bold mb-2">
                                                    Become a mentor by listing your EXPT
                                                </h4>
                                                <p className="text-xs text-muted mb-5">
                                                    Fill in details, customize your EXPT token and go live in minutes
                                                </p>
                                            </div>

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

                                            <FormField
                                                control={form.control}
                                                name="availableTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Set Time</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="E.g 2:15 PM" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="">
                                                <div className="text-sm mb-2">Time Zone</div>
                                                <div className="text-xs text-muted flex items-center">
                                                    <Globe2Icon className='w-4 h-4 mr-2' /> {"currentTimezone"}
                                                    <Button variant="ghost" className="text-xs hover:bg-transparent text-accent-3 hover:text-accent-4">Update</Button>
                                                </div>
                                            </div>

                                            <div className="w-full flex justify-end mb-[240px] gap-4">
                                                <Button className='w-[160px]' variant="outline" onClick={() => null}>Cancel</Button>
                                                <Button type="submit" isLoading={isListExptLoading} className='w-[160px]' disabled={isListExptLoading || !form.formState.isValid}>Save</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </>
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default SetAvailabilityStatus