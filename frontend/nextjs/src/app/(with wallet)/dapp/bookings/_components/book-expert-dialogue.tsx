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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import DataLoading from '@/components/ui/data-loading'
import NoData from '@/components/ui/no-data'
import useBackend from '@/lib/hooks/useBackend'
import { BookingCalendarForm } from './book-expert'
import { ExptListing } from '@/lib/types'

export default function BookExpertDialogue({expt}: {expt: ExptListing}){
    const {fetchProfile} = useBackend()
        
    const {data: author, isLoading}= useQuery({
        queryKey: ["author", expt.author],
        queryFn: ()=>fetchProfile(expt.author)

      });

      if(!author && isLoading) return <DataLoading/>
      if(!author) return <NoData message='No bookings'/>

return <Dialog >
                            <DialogTrigger>
                                <ExpertHubCard data={expt} type="modal" />
                            </DialogTrigger>

                            <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                                <div className="grid grid-cols-[35%_60%]">
                                    <ScrollArea className="h-[90vh]">
                                        <div className="border-r pr-6 py-6">
                                            <DialogHeader className='mb-6'>
                                                <DialogTitle>Book a Session with {author.displayName}</DialogTitle>
                                            </DialogHeader>
                                            <ExpertHubCard data={expt} disableLink={true} />
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Session Duration</div>
                                                <div className="text-xs text-muted">{expt.sessionCount} session(s) x {expt.sessionDuration} minutes</div>
                                            </div>

                                            <div className="">
                                                <div className="text-sm mb-2">Description</div>
                                                <div className="text-xs text-muted">{expt.description}</div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <ScrollArea className='h-[90vh] p-6'>
                                        <BookingCalendarForm />
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>
}
