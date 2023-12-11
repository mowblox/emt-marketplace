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
const PLACEHOLDER_COVER_PHOTO = require('@/assets/default-photo.png')


// Form Schema

const SESSION_COUNT = ["1", "2", "3", "4", "5"] as const;
const SESSION_DURATIONS = ["15", "30"] as const;

const FormSchema = z.object({
    coverImage: z
        .custom<File>((v) => v instanceof File, {
            message: 'Only images allowed e.g JPG, JPEG or PNG are allowed.',
        }),
    collectionSize: z.coerce.number(), // the tokenIds that are meant to be minted
    collectionName: z.string(),
    price: z.coerce.number().gte(1, {
        message: "Price is required",
    }).positive(),
    sessionCount: z.enum(SESSION_COUNT),
    sessionDuration: z.enum(SESSION_DURATIONS),
    description: z.string().optional()
});

// Component

const ClaimExptCard = ({profile}: {profile: UserProfile}) => {
    const {user}= useUser()
    const {listExpts} = useBackend();
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            collectionName: "",
            collectionSize: 1,
            coverImage: undefined,
            description: "",
            sessionCount: SESSION_COUNT[0],
            sessionDuration: SESSION_DURATIONS[0],
        }
})

const [isListExptLoading, setIsListExptLoading] = useState(false)
const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsListExptLoading(true)
        const {coverImage, collectionName, collectionSize, price, description, sessionCount, sessionDuration} = data
        const listing: NewExptListing = {
            collectionName: collectionName,
            collectionSize: collectionSize,
            price: price,
            paymentCurrency: "USDT",
            description: description || "",
            sessionCount: Number(sessionCount),
            sessionDuration: Number(sessionDuration),
            timestamp: serverTimestamp(),
            coverImage: coverImage,
            tokenIds: profile.ownedExptIds!
        }
          
        const res = await listExpts(listing)
        router.push(EXPERT_TICKET_PAGE(res))

        toast({
            title: "You submitted the following values:",
            description: (
                // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <div className="text-white">Your {collectionName} collection with {collectionSize} tickets has been listed</div>
                // {/* </pre> */}
            ),
        })
        setIsListExptLoading(false)
        form.reset()
    }
    
    const {claimExpt, profileReady, fetchUnclaimedExpt} = useBackend();
    const {uid} = useParams();
    const queryClient = useQueryClient();

 
    const { data: unclaimedExpt } = useQuery({
        queryKey: ["unclaimedExpt", uid],
        queryFn: ()=>fetchUnclaimedExpt(),
        enabled: profileReady
    });

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
                                    <ExpertHubCard data={{
                                        id: "1",
                                        collectionName: form.watch().collectionName,
                                        collectionSize: form.watch().collectionSize,
                                        price: form.watch().price,
                                        paymentCurrency: "USDT",
                                        tokenIds: [1, 2, 3, 4, 5],
                                        remainingTokenIds: [],
                                        imageURL: coverPhotoPreview ? coverPhotoPreview : String(PLACEHOLDER_COVER_PHOTO.default.src),
                                        description: form.watch().description!,
                                        sessionCount: Number(form.watch().sessionCount),
                                        sessionDuration: Number(form.watch().sessionDuration),
                                        author: user?.uid!,
                                        authorProfile: profile,
                                        timestamp: serverTimestamp()
                                    } } disableLink={true} />
                                    <div className="my-5">
                                        <div className="text-sm mb-2">Session Duration</div>
                                        <div className="text-xs text-muted">{form.watch().sessionCount} session(s) x {form.watch().sessionDuration} minutes</div>
                                    </div>

                                    <div className="my-5">
                                        <div className="text-sm mb-2">Description</div>
                                        <div className="text-xs text-muted">{form.watch().description}</div>
                                    </div>
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

                                            {/* {(formSteps < MAX_STEPS && formSteps == 0) && <> */}

                                            <FormField
                                                control={form.control}
                                                name="coverImage"
                                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                                    <FormItem>
                                                        <FormControl className="mb-3">
                                                            <div className="flex items-center justify-center border rounded-md p-4">
                                                                <Input
                                                                    key='file'
                                                                    name={name}
                                                                    type="file"
                                                                    ref={ref}
                                                                    onBlur={onBlur}
                                                                    placeholder="⇪ Upload an image"
                                                                    className="mb-4 w-1/2 rounded-full"
                                                                    accept="image/png, image/jpeg"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        onChange(e.target.files?.[0]);
                                                                        setCoverPhotoPreview(file ? URL.createObjectURL(file) : null);
                                                                      }}
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
                                                name="collectionSize"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Collection Size</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Number of EXPT to list" type="number" min={1} {...field} />
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
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Number of sessions" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {SESSION_COUNT.map((el, key) => (<SelectItem key={el} value={el}>{`${el} session${key > 1 ? 's' : ''}`} </SelectItem>))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="sessionDuration"
                                                    render={({ field,  }) => (
                                                        <FormItem>
                                                            <FormLabel>Session Duration</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Session Durations" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {SESSION_DURATIONS.map((el) => (<SelectItem key={el} value={el}>{el} minutes</SelectItem>))}
                                                                </SelectContent>
                                                            </Select>
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
                                                            <Input 
                                                                placeholder="Price for your EXPT" type='number' min={0} {...field}/>
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
                                            {/* <div className="w-full flex justify-end mb-[240px]">
                        <Button onClick={() => setFormSteps(1)} className='w-[160px]'>Next</Button>
                    </div> */}
                                            <div className="w-full flex justify-end mb-[240px] gap-4">
                                                <Button className='w-[160px]' variant="outline" onClick={() => null}>Cancel</Button>
                                                <Button type="submit" isLoading={isListExptLoading}  className='w-[160px]' disabled={isListExptLoading || !form.formState.isValid}>Save &amp; List</Button>
                                            </div>
                                            {/* </>} */}

                                            {/* {(formSteps < MAX_STEPS && formSteps == 1) && <>

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
                        <Button onClick={()=>onSubmit()} type="submit" className='w-[160px]'>Save &amp; List</Button>
                    </div>
                </>} */}
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

export default ClaimExptCard