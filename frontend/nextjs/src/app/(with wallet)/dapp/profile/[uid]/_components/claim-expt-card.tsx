import { Button } from '@/components/ui/button'
import React, { useRef, useState } from 'react'
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
import { UserProfile } from '@/lib/types';
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


const FormSchema = z.object({
    coverImage: z
        .string()
        .refine((value) => isValidFileType(value), {
            message:
                "Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.",
        })
        .optional(),
    tokenIds: z.any(),
    price: z.number().min(1, {
        message: "Please add a price",
    }),
    availableDate: z.date({
        required_error: "A date is required.",
    }),
    availableTime: z.string({
        required_error: "A time is required.",
    }),
    availableDuration: z.number().optional(),
    description: z.string().optional()
})

const ClaimExptCard = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const MAX_STEPS = 2
    const [formSteps, setFormSteps] = useState(0);

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

    const imageRef = useRef<HTMLInputElement>(null);


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

                {(formSteps < MAX_STEPS && formSteps == 0) && <>

                    <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl className="mb-3">
                                    <>
                                        <div className="w-20 h-20 rounded-full relative">
                                            <Image
                                                src={
                                                    imageRef.current?.files?.[0]
                                                        ? URL.createObjectURL(imageRef.current?.files?.[0])
                                                        : placeholderImage
                                                }
                                                fill
                                                placeholder={placeholderImage}
                                                className="object-cover rounded-full"
                                                alt={`Preview your profile picture`}
                                            />
                                        </div>

                                        <Input
                                            placeholder="New Profile Picture"
                                            className="mb-4"
                                            type="file"
                                            {...field}
                                            ref={imageRef}
                                        />
                                        <div className="mb-4"></div>
                                    </>
                                </FormControl>
                                <FormLabel>Cover Photo</FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tokenIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Token Id</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Token Ids" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input placeholder="Price for your EXPT token" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message (optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="What would you want your mentee to know about you and your expertise" {...field} />
                                </FormControl>
                                <FormMessage className="text-xs text-muted font-normal" />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-end mb-[240px]">
                        <Button onClick={() => setFormSteps(1)} className='w-[160px]'>Next</Button>
                    </div>
                </>}
                
                {(formSteps < MAX_STEPS && formSteps == 1) && <>

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

                    <FormField
                        control={form.control}
                        name="availableDuration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Set Duration</FormLabel>
                                <FormControl>
                                    <Input placeholder="Duration in minutes" {...field} />
                                </FormControl>
                                <FormMessage />
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

                    <div className="w-full flex justify-end mb-[240px] gap-4">
                        <Button className='w-[160px]' variant="outline" onClick={()=> setFormSteps(0)}>Back</Button>
                        <Button type="submit" className='w-[160px]'>Save &amp; List</Button>
                    </div>
                </>}
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
                                <div className="border-r h-screen pr-6 py-6">
                                    <DialogHeader className='mb-6'>
                                        <DialogTitle>Preview</DialogTitle>
                                    </DialogHeader>
                                    <ExpertHubCard data={expert} disableLink={true} />
                                    <div className="my-5">
                                        <div className="text-sm mb-2">Session Duration</div>
                                        <div className="text-xs text-muted">{1} session(s) x {50} minutes</div>
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