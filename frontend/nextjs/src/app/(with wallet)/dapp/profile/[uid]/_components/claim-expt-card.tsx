import { Button } from '@/components/ui/button'
import React from 'react'
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Globe2Icon } from 'lucide-react'
import { CalendarIcon } from "@radix-ui/react-icons"

import { Textarea } from '@/components/ui/textarea'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { UserProfile } from '@/lib/types';


const FormSchema = z.object({
    availableDate: z.date({
        required_error: "A date is required.",
    }),
    message: z.string().optional()
})

const ClaimExptCard = () => {
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

    const dummyUser: UserProfile = {
        uid: "string",
        displayName: "Lisa Brumm",
        tags: ["react", "ruby", "AI"],
        about: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
        isExpert: true,
        skill: "Ruby",
        level: 3,
        username: "@lisabrum",
        sessionStats: {
            sessions: 900,
            timeSpent: 4924,
        }
    }

    const expert = {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
            id: "eiwoi2424",
            imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Juno",
            description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
            sessionCount: 1,
            sessionDuration: 30,

        },
        author: dummyUser,
    }

    const ClaimExptForm = () => {
        return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="">
                <h4 className="text-md text-foreground font-bold mb-2">
                    Become a mentor by listing your EXPT
                </h4>
                <p className="text-xs text-muted mb-5">
                Fill in details, customize your EXPT token and go live in minutes
                </p>
            </div>
            {/* <FormField
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
            /> */}

            

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
    }
    return (
        <div className="mb-6 flex p-4 items-center justify-between bg-accent-shade rounded-md">
            <div className="flex items-center">
                <div className="flex items-center text-sm">
                    <HiOutlineTicket className="w-4 h-4 ml-1 text-accent-3" />
                    <div className="ml-1 flex items-center text-muted">Unclaimed EXPT: <span className="ml-1 text-foreground">50</span></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button size="sm" className="px-5">Claim EXPT</Button>
                <Dialog>
                    <DialogTrigger>
                        <Button size="sm" variant="gradient" className="px-5">List EXPT</Button>
                    </DialogTrigger>

                            <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                                <div className="grid grid-cols-[35%_60%]">
                                    <ScrollArea className="h-[90vh]">
                                        <div className="border-r pr-6 py-6">
                                            <DialogHeader className='mb-6'>
                                                <DialogTitle>Preview</DialogTitle>
                                            </DialogHeader>
                                            <ExpertHubCard data={expert} disableLink={true} />
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Session Duration</div>
                                                <div className="text-xs text-muted">{1} session(s) x {50} minutes</div>
                                            </div>

                                            <div className="">
                                                <div className="text-sm mb-2">Description</div>
                                                <div className="text-xs text-muted">{"metadata.description"}</div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <ScrollArea className='h-[90vh] p-6'>
                                        <ClaimExptForm />
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>
            </div>
        </div>
    )
}

export default ClaimExptCard