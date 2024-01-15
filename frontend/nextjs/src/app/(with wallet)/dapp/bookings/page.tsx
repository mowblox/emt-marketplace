
'use client';
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Booking, BookingFilters, Content, ExpertTicket, ExptFilters, ExptListing, ExptListingWithAuthorProfile, ReviewItem as ReviewItemProps, UserProfile } from '@/lib/types';
import ExpertHubCard from '@/components/ui/expert-hub-card';
import SessionReviewForm from './_components/session-review-form';
import BookExpert from './_components/book-expert';
import { Timestamp } from 'firebase/firestore';
import { useUser } from '@/lib/hooks/user';
import InfiniteScroll from '@/components/ui/infinite-scroller';
import useBackend from '@/lib/hooks/useBackend';

const Bookings = () => {
const {fetchBookings, fetchExpts} = useBackend()
const {user} = useUser();

    return (
        <div className="col-span-4">
            <h4 className='text-xl text-foreground font-bold mb-5'>Bookings</h4>
            <Tabs defaultValue="tokens" className="w-full mt-4">
                <TabsList >
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="tokens" className='pt-2'>
                <BookExpert />
                </TabsContent>
                <TabsContent value="history" className='pt-2'>
                    <InfiniteScroll className="grid grid-cols-[1fr] md:grid-cols-[280px_1fr] gap-8 mt-4"
                       fetcher={fetchBookings}
                       filters={{mentee: user?.uid} as ExptFilters}
                       queryKey={["bookings"]}
                       noDataMessage="No bookings found. Please try later"
                       ItemComponent ={({data}: {data: Booking})=><><div className="opacity-[0.4]">
                            <ExpertHubCard data={data.exptListing!} disableLink={true} />
                        </div>
                        <div className="md:mx-12">
                            <SessionReviewForm />
                        </div></>}
                    />
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default Bookings