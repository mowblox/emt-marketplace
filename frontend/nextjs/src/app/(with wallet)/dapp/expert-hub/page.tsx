'use client';
import { Button } from '@/components/ui/button'
import { Search } from '@/components/ui/forms/search'
import React from 'react'
import { HiMiniAdjustmentsVertical } from 'react-icons/hi2'
import { ExpertTicket, ExptListing, UserProfile } from '@/lib/types'
import ExpertHubCard from '@/components/ui/expert-hub-card'
import { Timestamp } from 'firebase/firestore'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import DataLoading from '@/components/ui/data-loading'
import NoData from '@/components/ui/no-data'
import useBackend from '@/lib/hooks/useBackend'

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

    const dummyData: ExptListing[] = [
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
          author: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          timestamp: Timestamp.now()
      },
      {
        id: "11",
          collectionName: "Juno",
          collectionSize: 10,
          price: 91,
          paymentCurrency: "USDT",
          tokenIds: [6, 7, 8, 9],
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 482,
          sessionDuration: 42,
          author: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          timestamp: Timestamp.now()
      }

    ]
    const loadMoreRef = React.useRef<HTMLDivElement>(null);
    const {fetchExptListings} = useBackend();
    const [filters, setFilters] = React.useState<Record<string, any>>({});
    
  
    const { entry, ref } = useIntersection({
      threshold: 0,
      // root: loadMoreRef.current
    });

    const {
      data: listingPages,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
      isLoading,
      error
    } = useInfiniteQuery({
      queryKey: ["exptListings", filters],
      queryFn: async ({ pageParam }) => {
        const contents = await fetchExptListings(pageParam, 1, filters);
        return contents;
      },
      initialPageParam : undefined as unknown as Timestamp,
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1]?.timestamp as Timestamp;
      },
      select:(data)=>{
        return {
          pages:data.pages.flat(),
          pageParams:[data.pageParams.pop()]
        }
        }
    });

    console.info("postsloading error:", error)
  
  if (hasNextPage && entry?.isIntersecting) {
    fetchNextPage();
  }
  
  if(!listingPages && isLoading) {
    return (<div className="h-screen">
        <DataLoading />
      </div>)
  }

  if(!listingPages?.pages[0] && !isLoading) {
    return (<div className="h-screen">
        <NoData message="No posts" />
      </div>)
  }

  console.log('contendData', listingPages)

    return (
        <div className="col-span-4">
            <div className="flex justify-between items-center w-full mb-12">
                <Search className='w-auto lg:w-2/3' placeholder='Search by name or expert category'/>
                <Button variant="outline"><HiMiniAdjustmentsVertical className="mr-1" />Filter</Button>
            </div>

            <div className="w-full flex flex-wrap gap-4 flex-grow">
                {listingPages?.pages.map(listing => {
                    return <ExpertHubCard key={listing.id} data={listing}/>
                })}
            </div>
        </div>
    )
}

export default ExpertHub