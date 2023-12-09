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
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"
import { Globe2Icon } from 'lucide-react'
import { CalendarIcon } from "@radix-ui/react-icons"

import { Textarea } from '@/components/ui/textarea'
import { cn, isValidFileType } from "@/lib/utils"
import { ExpertTicket, UserProfile } from '@/lib/types';
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
import { useParams } from 'next/navigation'


const FormSchema = z.object({
    coverImage: z
        .string()
        .refine((value) => isValidFileType(value), {
            message:
                "Invalid file type. Only images e.g JPG, JPEG or PNG are allowed.",
        })
        .optional(),
    tokenIds: z.any(),
    collectionName: z.string(),
    price: z.number().min(1, {
        message: "Please add a price",
    }),
    availableDate: z.date({
        required_error: "A date is required.",
    }),
    availableTime: z.string({
        required_error: "A time is required.",
    }),
    sessionCount: z.number().max(5, {
        message: "Can't have more than 4 sessions in a ticket"
    }),
    availableDuration: z.number().optional(),
    description: z.string().optional()
})

const ClaimExptCard = ({profile}: any) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const watchForm = form.watch() // returns an array where you index according to the order of the watched data
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
    const {claimExpt, profileReady, fetchUnclaimedExpt} = useBackend();
    const {uid} = useParams();
    const queryClient = useQueryClient();

 
    const { data: unclaimedExpt } = useQuery({
        queryKey: ["unclaimedExpt", uid],
        queryFn: ()=>fetchUnclaimedExpt(),
        enabled: profileReady
    });


    console.log('watch', form.watch())




    const {mutateAsync: handleClaimExpt} = useMutation({
        mutationFn: claimExpt,
        onSuccess: () => {
            queryClient.setQueryData(["unclaimedExpt", uid], ()=>{
              return 0;
            })
            toast({
              title: 'Claimed',
              description: 'You have claimed your Expt',
              variant: 'success',
              loadProgress: 100,
            })
          },
          onMutate:()=>{
            toast({
              title: 'Claiming..',
              description: 'Mining Transaction',
              duration: Infinity,
              loadProgress: 10,
            })
      
          },
          onError: (e: any) => {
            // Handle error state here
            console.error("oops!", e.message)
          },
        
    })


    const defaultUser: UserProfile = {
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

    const defaultExpertTicket = {
        price: 0,
        paymentCurrency: "USDT",
        metadata: {
            id: "",
            imageURL: placeholderImage,
            title: "",
            description: "",
            sessionCount: 1,
            sessionDuration: 30,

        },
        author: defaultUser,
    }
    // const [previewExptData, setPreviewExptData] = useState<ExpertTicket>(defaultExpertTicket)


    // useEffect(() => {
        const previewExptData = {
            price: watchForm.price ? watchForm.price : 0,
            paymentCurrency: "USDT",
            metadata: {
                id: "eiwoi2424", // the id of the token to be minted
                imageURL: imageRef.current?.files?.[0]
                    ? URL.createObjectURL(imageRef.current?.files?.[0])
                    : placeholderImage,
                title: watchForm.collectionName ? watchForm.collectionName : "",
                description: watchForm.description ? watchForm.description : "",
                sessionCount: watchForm.sessionCount ? watchForm.sessionCount : 1,
                sessionDuration: watchForm.availableDuration ? watchForm.availableDuration : 30,
            },
            author: profile, // TODO @jovells include the mentor's level in the profile object
        }
    // }, [imageRef])
    


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
                                    <div className="flex items-center justify-center border rounded-md p-4">
                                        {/* <div className="w-20 h-20 rounded-full relative">
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
                                        </div> */}

                                        <Input
                                            placeholder="⇪ Upload Image"
                                            className="mb-4 w-1/2 rounded-full"
                                            type="file"
                                            {...field}
                                            ref={imageRef}
                                        />
                                        <div className="mb-4"></div>
                                    </div>
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
                                <FormLabel>Collection Size</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-full md:w-1/2">
                                            <SelectValue placeholder="Quantity of EXPT to list" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="all">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                    <FormField
                        control={form.control}
                        name="sessionCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Count</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Number of sessions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 session</SelectItem>
                                            <SelectItem value="2">2 sessions</SelectItem>
                                            <SelectItem value="3">3 sessions</SelectItem>
                                            <SelectItem value="4">4 sessions</SelectItem>
                                            <SelectItem value="5">5 sessions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="tokenIds"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Duration</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Duration of sessions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </div>

                    <FormField
                        control={form.control}
                        name="collectionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Collection Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name your collection" {...field} />
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
                                    <Input placeholder="Price for your EXPT" {...field} />
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
        <div className="mb-6 flex p-4 flex-col gap-6 md:gap-0 md:flex-row items-center justify-between bg-accent-shade rounded-md">
            <div className="flex items-center text-sm">
                <HiOutlineTicket className="w-4 h-4 ml-1 text-accent-3" />
                <div className="ml-1 flex items-center text-muted">Unclaimed EXPT: <span className="ml-1 text-foreground">{unclaimedExpt}</span></div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Button size="sm" onClick={()=>handleClaimExpt()} className="w-full md:w-auto px-5">Claim EXPT</Button>
                <Dialog>
                    <DialogTrigger>
                        <Button size="sm" variant="gradient" className="w-full md:w-auto px-5">List EXPT</Button>
                    </DialogTrigger>

                    <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                        <div className="grid grid-cols-1 md:grid-cols-[35%_60%]">
                            <ScrollArea className="hidden md:block h-[90vh]">
                                <div className="border-r h-screen pr-6 py-6">
                                    <DialogHeader className='mb-6'>
                                        <DialogTitle>Preview</DialogTitle>
                                    </DialogHeader>
                                    <ExpertHubCard data={previewExptData} disableLink={true} />
                                    <div className="my-5">
                                        <div className="text-sm mb-2">Session Duration</div>
                                        <div className="text-xs text-muted">{previewExptData.metadata.sessionCount} session(s) x {previewExptData.metadata.sessionDuration} minutes</div>
                                    </div>

                                    <div className="my-5">
                                        <div className="text-sm mb-2">Description</div>
                                        <div className="text-xs text-muted">{previewExptData.metadata.description}</div>
                                    </div>
                                </div>
                            </ScrollArea>
                            <ScrollArea className='h-[90vh] pt-6 md:p-6'>
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