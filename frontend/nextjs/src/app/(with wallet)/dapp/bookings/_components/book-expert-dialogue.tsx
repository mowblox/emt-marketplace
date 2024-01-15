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
import { ExptListing, ExptListingWithAuthorProfile } from '@/lib/types'

export default function BookExpertDialogue({data}: {data: {listing: ExptListingWithAuthorProfile, id: string, remainingSessions: number}}){
   const {listing, id, remainingSessions} = data;
return <Dialog >
                            <DialogTrigger>
                                <ExpertHubCard tokenId={id} data={listing} type="modal" />
                            </DialogTrigger>

                            <DialogContent className='w-full py-0 max-h-[90vh] overflow-hidden'>
                                <div className="grid grid-cols-[35%_60%]">
                                    <ScrollArea className="h-[90vh]">
                                        <div className="border-r pr-6 py-6">
                                            <DialogHeader className='mb-6'>
                                                <DialogTitle>Book a Session with {listing.authorProfile.displayName}</DialogTitle>
                                            </DialogHeader>
                                            <ExpertHubCard data={listing} disableLink={true} />
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Token Id</div>
                                                <div className="text-xs text-muted">{id}</div>
                                            </div>
                                            <div className="my-5">
                                                <div className="text-sm mb-2">Session Duration</div>
                                                <div className="text-xs text-muted">{listing.sessionDuration} session(s) x {listing.sessionCount} minutes</div>
                                            </div>

                                            <div className="">
                                                <div className="text-sm mb-2">Description</div>
                                                <div className="text-xs text-muted">{listing.description}</div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                    <ScrollArea className='h-[90vh] p-6'>
                                        <BookingCalendarForm remainingSessions={remainingSessions} exptTokenId={id} exptListing={listing}/>
                                    </ScrollArea>
                                </div>
                            </DialogContent>
                        </Dialog>
}
