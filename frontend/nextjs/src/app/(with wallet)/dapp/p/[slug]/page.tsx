
"use client";
import React from 'react'
import {
  HiCheckBadge, HiOutlineUserPlus,
  HiUser, HiOutlineShare
} from 'react-icons/hi2'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RightSidebar } from '../../../_components/right-sidebar'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import useBackend from '@/lib/hooks/useBackend'
import DataLoading from '@/components/ui/data-loading';
import { Content } from '@/lib/types';
import Voter from '@/components/ui/Voter';
import NoData from '@/components/ui/no-data';
import { formatDistance } from 'date-fns';
import { useUser } from "@/lib/hooks/user";
import { toast } from "@/components/ui/use-toast";


const Post = ({ params }: { params: { slug: string } }) => {
  const queryClient = useQueryClient();
  const { fetchSinglePost, unfollowUser, checkFollowing, followUser } = useBackend();

  const cachedPosts = queryClient.getQueryData(["posts"]) as { pages: [][] }
  console.log('cached', cachedPosts);

  let post: Content | undefined;

  if (cachedPosts) {
    cachedPosts.pages.find((page: Content[]) => {
      post = page.find((post) => { post.metadata.id === params.slug })
    })
  }

  const { user } = useUser();

  const { data: newPost, isLoading, error } = useQuery({
    queryKey: ["post", params.slug],
    queryFn: () => fetchSinglePost(params.slug),
    enabled: !post,
    select(data) {
      post = data
      return data
    },
  });

  //check if following
  const { data: isFollowingUser, } = useQuery({
    queryKey: ["isFollowing", user?.uid],
    queryFn: (v) => checkFollowing(user?.uid as string),
    // enabled: !isCurrentUserProfile && !!user?.uid,
  })

  //follow/unfollow user
  const { mutateAsync } = useMutation({
    mutationFn: () => isFollowingUser ? unfollowUser(user?.uid!) : followUser(user?.uid!),
    onSuccess: () => {
      queryClient.setQueryData(["isFollowing", user?.uid!], (OldfollowStatus: boolean) => {
        return !OldfollowStatus;
      })
    },
    onError: (e: any) => {
      // Handle error state here
      console.error("oops!", e.message)
    },
  });

  async function toggleFollowing() {
    await mutateAsync();
    toast({
      title: isFollowingUser ? 'Unfollowed' : 'Followed',
      description: isFollowingUser ? 'You have unfollowed this user' : 'You have followed this user',
      variant: 'success',
    })

  }

  console.log('newPost', newPost, 'error', error)

  post = post || newPost;



  if (!user) {
    // bypass follow / not follow checks and functions if the user is not signed in
    return <PostTemplate post={post} isLoading={isLoading} />
  }

  return <PostTemplate post={post} isLoading={isLoading} isFollowingUser={isFollowingUser} toggleFollowing={toggleFollowing} />


}

interface PostTemplateProps {
  post: Content | undefined;
  isLoading: boolean;
  toggleFollowing?: () => void;
  isFollowingUser?: boolean;
}

const PostTemplate = ({ post, isLoading, isFollowingUser, toggleFollowing }: PostTemplateProps) => {
  if (!post && isLoading) {
    return (<div className="h-screen">
      <DataLoading />
    </div>)
  }
  if (!post) {
    return (<div className="h-screen">
      <NoData message='Post does not exist' />
    </div>)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 col-span-4">
      <div className="h-full px-4 py-6 lg:px-6 col-span-1 md:col-span-4 md:border-x">
        <ScrollArea className="h-[90vh] w-full">
          <Card className='border-none'>
            <CardHeader className='px-0 pt-0'>
              <div className='flex items-center'>
                <div className="w-10 h-10 relative">
                  <Image
                    fill
                    className='rounded-full object-cover'
                    loading="eager"
                    src={post.author?.photoURL!}
                    alt={`${post.author?.displayName}-photoURL
                        `}
                    quality={80}
                  />
                </div>
                <div className='ml-3'>
                  <div className="flex items-center">
                    <p className='text-md text-foreground'>{post.author?.displayName}</p>
                    {post.author?.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                    <div className='ml-2 text-[11px] text-muted'>{formatDistance(post.post.timestamp.toDate(), new Date(), { addSuffix: true })}</div>
                  </div>
                  {toggleFollowing && <Button
                    variant="ghost"
                    onClick={toggleFollowing}
                    className="text-xs px-0 py-0 rounded-sm h-auto hover:bg-transparent hover:text-accent-3 text-muted">
                    {isFollowingUser ? <><HiUser className="mr-1" /> Following</> : <>
                      <HiOutlineUserPlus className="mr-1" /> Follow
                    </>}
                  </Button>}
                </div>
              </div>

            </CardHeader>
            <CardContent className='space-y-5 px-0'>
              <div className="w-full h-[400px] relative">
                <Image
                  fill
                  src={post.post.imageURL as string}
                  className='rounded-md object-cover'
                  loading="lazy"
                  alt={`${post.post.title} cover photo`}
                />
              </div>
              <CardTitle className='font-bold text-3xl text-foreground tracking-wide'>{post.post.title}</CardTitle>
              <CardDescription className='text-muted text-sm'><div dangerouslySetInnerHTML={{ __html: post.post.body }}>
              </div></CardDescription>
            </CardContent>
            <Separator className="bg-border mb-3" />
            <CardFooter className='pb-0 px-0 flex justify-between'>

              <Voter post={post} />

              <Button variant="ghost" aria-label='Upvote a post' size="icon">
                <HiOutlineShare className="h-5 w-5 text-foreground" />
              </Button>
            </CardFooter>
          </Card>
        </ScrollArea>
      </div>
      <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2" >
        {/* TODO @jovells 1. display random user profiles */}
        {/* <>
          <div className="mb-8">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Top Creators
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return <Link href={"dapp" + profile.href} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.photoURL
                        }
                        alt={`${profile.displayName}-photoURL
                `}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.displayName}</p>
                        {profile.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                      </div>
                      <Badge>{profile.skill}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted">
                    <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                    <div className="ml-1">
                      245 MENT
                    </div>
                  </div>
                </Link>
              })}


            </div>
          </div>

          <div className="">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Who to Follow
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return <Link href={"dapp" + profile.href} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.photoURL
                        }
                        alt={`${profile.displayName}-photoURL
                `}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.displayName}</p>
                        {profile.isExpert === true && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
                      </div>
                      <Badge>{profile.skill}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted">
                    <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                    <div className="ml-1">
                      245 MENT
                    </div>
                  </div>
                </Link>
              })}


            </div>
          </div>
        </> */}
      </RightSidebar>
    </div>
  )
}



export default Post