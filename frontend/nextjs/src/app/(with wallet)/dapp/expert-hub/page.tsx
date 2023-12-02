import { Button } from '@/components/ui/button'
import { Search } from '@/components/ui/forms/search'
import React from 'react'
import { HiMiniAdjustmentsVertical } from 'react-icons/hi2'
import { ExpertTicket, UserProfile } from '@/lib/types'
import ExpertHubCard from '@/components/ui/expert-hub-card'
import { useUser } from "@/lib/hooks/user";

const ExpertHub = () => {
  const dummyUser: UserProfile = {
    uid: "string",
    displayName: "Lisa Brumm",
    tags: ["react", "ruby", "AI"],
    about: "string",
    isExpert: true,
    skill: "Ruby",
    level: 3,
    username: "@lisabrum",
    sessionStats: {
      sessions: 900,
      timeSpent: 4924,
    }
  }

    const dummyData: ExpertTicket[] = [
      {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",

        },
        author: dummyUser,
      },
      {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",

        },
        author: dummyUser,
      },
      {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",

        },
        author: dummyUser,
      },
      {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",

        },
        author: dummyUser,
      },
      {
        price: 9,
        paymentCurrency: "USDT",
        metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",

        },
        author: dummyUser,
      }
    ]

    return (
        <div className="col-span-4">
            <div className="flex justify-between items-center w-full mb-12">
                <Search className='w-auto lg:w-2/3' placeholder='Search by name or expert category'/>
                <Button variant="outline"><HiMiniAdjustmentsVertical className="mr-1" />Filter</Button>
            </div>

            <div className="w-full flex flex-wrap gap-4 flex-grow">
                {dummyData.map(expert => {
                    return <ExpertHubCard key={expert.metadata.id} data={expert}/>
                })}
            </div>
        </div>
    )
}

export default ExpertHub