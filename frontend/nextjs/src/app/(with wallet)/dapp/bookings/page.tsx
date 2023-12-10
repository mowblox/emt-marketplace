
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Content, ExpertTicket, ExptListing, ReviewItem as ReviewItemProps, UserProfile } from '@/lib/types';
import ExpertHubCard from '@/components/ui/expert-hub-card';
import SessionReviewForm from './_components/session-review-form';
import BookExpert from './_components/book-expert';
import { Timestamp } from 'firebase/firestore';
import { useUser } from '@/lib/hooks/user';

const Bookings = () => {
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

    const dummyOtherExperts: ExptListing[] = [
        {
            id: "1",
            collectionName: "Juno",
            collectionSize: 10,
            price: 9,
            paymentCurrency: "USDT",
            tokenIds: [1, 2, 3, 4, 5],
            imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Juno",
            description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
            sessionCount: 482,
            sessionDuration: 42,
            author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            timestamp: Timestamp.now()
          },
          {
            id: "1",
            collectionName: "Juno",
            collectionSize: 10,
            price: 9,
            paymentCurrency: "USDT",
            tokenIds: [1, 2, 3, 4, 5],
            imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Juno",
            description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
            sessionCount: 482,
            sessionDuration: 42,
            author: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            timestamp: Timestamp.now()
          }
    ]

    return (
        <div className="col-span-4">
            <h4 className='text-xl text-foreground font-bold mb-5'>Bookings</h4>
            <Tabs defaultValue="tokens" className="w-full mt-4">
                <TabsList>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="tokens" className='pt-2'>
                    <div className="w-full mt-4">
                        <BookExpert ownedExpt={dummyOtherExperts} />
                    </div>
                </TabsContent>
                <TabsContent value="history" className='pt-2'>
                    <div className="grid grid-cols-[1fr] md:grid-cols-[280px_1fr] gap-8 mt-4">
                        <div className="opacity-[0.4]">
                            <ExpertHubCard data={dummyOtherExperts[0]} disableLink={true} />
                        </div>
                        <div className="md:mx-12">
                            <SessionReviewForm />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default Bookings