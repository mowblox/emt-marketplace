
"use client";
import React from 'react'
import { HiCheckBadge, HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineShare, HiOutlineFire } from 'react-icons/hi2'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useBackend from '@/lib/hooks/useBackend';
import DataLoading from '@/components/ui/data-loading';
import { Content, ExpertTicket, ExptListing, ExptListingWithAuthorProfile, ReviewItem as ReviewItemProps, UserProfile } from '@/lib/types';
import ExpertHubCard from '@/components/ui/expert-hub-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profilePlaceholderImage } from "@/lib/utils";
import { ReviewItem } from './_components/review-item';
import NoData from '@/components/ui/no-data';
import { useRouter } from 'next/navigation';
import { BOOKINGS_PAGE } from '@/app/(with wallet)/_components/page-links';
import { useUser } from '@/lib/hooks/user';
import { useConnectModal } from '@rainbow-me/rainbowkit';



const ExpertDetails = ({ params }: { params: { slug: string } }) => {
  const queryClient = useQueryClient();
  const { fetchSingleListing, buyExpt, delistExpts } = useBackend();
  const router = useRouter();
  const { user } = useUser();
  const {openConnectModal} = useConnectModal()



  const { isLoading, data: listing } = useQuery({
    queryKey: ["singleExptListing", params.slug],
    queryFn: async () => {
      const cachedListings = queryClient.getQueriesData({queryKey: ["exptListings"]}) as [queryKey: any, data: {pages: ExptListingWithAuthorProfile[][]} | undefined][]
    
      console.log('cachedexpts', cachedListings);
      let listing: ExptListingWithAuthorProfile 
    
      if (cachedListings[0]) {
        cachedListings[0][1]?.pages.some((page: ExptListingWithAuthorProfile[]) => {
          const found = page.find((item) => item.id === params.slug )
          if (found) {
            listing = found
            return true
          }
        })
        return listing! || await fetchSingleListing(params.slug)
      }
      else return await fetchSingleListing(params.slug)},
  });


 
  async function handleBuyExpt() {
    if(!user){
     return  openConnectModal?.()
    }
    const tokenBoughtId = await buyExpt(listing!);
    if(tokenBoughtId){
      queryClient.invalidateQueries({queryKey: ['singleExptListing', params.slug]})
      queryClient.setQueriesData({queryKey:['exptListings']}, (oldData: any) => {
          console.log('oldData', oldData);
          return {
            ...oldData,
            pages: oldData.pages.map((page: ExptListingWithAuthorProfile[]) => {
              return page.map((item) => {
                if(item.id === listing?.id){
                  item.remainingTokenIds = item.remainingTokenIds.filter((tokenId) => tokenId !== tokenBoughtId)
                }
                return item
              
              })
            })
          }
      })
      router.push(BOOKINGS_PAGE)
    }
  }





  async function handleDelistExpt(){
    console.log('deslist not implemented yet');
    const successful = await delistExpts(listing!);
    if(successful){
      router.back()
    }
  }

  if (isLoading && !listing) {
    return <DataLoading />
  }

  if (!listing) {
    return <NoData message='No Listings Available'/>
  }
  const dummyReviews: ReviewItemProps[] = [
    {
      user: listing.authorProfile,
      content: {
        body: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
        datePublished: '10 November, 2023'
      }
    },
    {
      user: listing.authorProfile,
      content: {
        body: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
        datePublished: '10 November, 2023'
      }
    },
    {
      user: listing.authorProfile,
      content: {
        body: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
        datePublished: '10 November, 2023'
      }
    },
    {
      user: listing.authorProfile,
      content: {
        body: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
        datePublished: '10 November, 2023'
      }
    },
  ]


  return (
    <div className="col-span-4">
      <div className="h-full px-4 py-6 lg:px-6 col-span">
        <div className="w-full mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 justify-between gap-4">
            <div className="col-span-1 md:col-span-3 lg:col-span-5 border-3">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl">
                  {listing.authorProfile.displayName}
                </h3>
                <p className="text-sm">
                  @{listing.authorProfile.username}
                </p>
                <div className="flex items-center text-sm text-accent-3">
                  <HiOutlineFire className="w-4 h-4 ml-1" />
                  <div className="ml-1">{listing.authorProfile.ment} MENT</div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full mt-4 md:pr-12">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className='pt-2'>
                  <p className="text-foreground text-sm leading-loose">
                    {listing.description}
                  </p>

                  <div className="mt-4">
                    <h4 className="text--md font-semibold">
                      Expertise
                    </h4>
                    <div className="flex gap-2 flex-wrap mt-2 capitalize">
                      {listing.authorProfile.tags?.map((skill, key) => (<Badge variant="secondary" className='px-3' key={`${listing?.authorProfile.uid}-${key}`}>{skill}</Badge>))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">
                      Session Stats
                    </h4>
                    <div className="flex gap-2 flex-wrap mt-2 capitalize">
                      <Badge variant="secondary" className='px-3'>{listing.authorProfile.sessionStats?.timeSpent || 0} mins</Badge>
                      <Badge variant="secondary" className='px-3'>{listing.authorProfile.sessionStats?.sessions || 0} sessions</Badge>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className='pt-2'>
                  {/* TODO: connect reviews to backend */}
                  {/* {dummyReviews.map((review, key) => (<ReviewItem key={`review-${key}`} review={review} />))} */}
                  <NoData message='No reviews found.'/>
                </TabsContent>
              </Tabs>
            </div>
            <div className="order-first md:order-last col-span-1 md:col-span-2 lg:col-span-2  border-3">
              <ExpertHubCard data={listing} disableLink={true} />
              {
                user?.uid === listing.authorProfile.uid ?
                <Button onClick={handleDelistExpt} className='w-full mt-5'>Delist Collection</Button>:
              <Button onClick={handleBuyExpt} className='w-full mt-5'>Buy EXPT</Button>
              }
            </div>
          </div>
        </div>

        {/* <div className="w-full mt-24">
          <h3 className="text-lg mb-4">
            Similar Expert Profiles
          </h3>
          <div className="w-full flex flex-wrap gap-4 flex-grow">
            {cachedListings?.pages[0].map((expert, key) => {
              if (key >= 4) return
              return <ExpertHubCard key={`expertsss-${key}`} data={expert} />
            })}
          </div>
        </div> */}
      </div>
    </div>
  )
}



export default ExpertDetails