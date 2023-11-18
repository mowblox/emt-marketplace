"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/ui/post-card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RightSidebar } from "./_components/right-sidebar";
import Image from "next/image";
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@/lib/hooks/user";

const dummyPosts = [
  {
    author: {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true"
    },
    post: {
      title: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image: "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago"
    }
  },
  {
    author: {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true"
    },
    post: {
      title: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image: "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago"
    }
  },
  {
    author: {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true"
    },
    post: {
      title: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image: "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago"
    }
  },
  {
    author: {
      name: "Naval",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      mentor: "true"
    },
    post: {
      title: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image: "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago"
    }
  },
]

const topCreatorList = [
  {
    name: "Naval",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    mentor: "false",
    skill: "UI Design",
    username: "naval",
    ment: 134
  },
  {
    name: "Naval",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    mentor: "true",
    skill: "Java",
    username: "naval",
    ment: 693
  },
  {
    name: "Naval",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    mentor: "true",
    skill: "Ruby",
    username: "naval",
    ment: 953
  },
  {
    name: "Naval",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    mentor: "true",
    skill: "AI",
    username: "naval",
    ment: 422
  },
]


export default function RootLayout() {
  const { EMTMarketPlace, ExpertToken, MentorToken } = useContracts();
  const {user, updateUser, isLoading} = useUser();
  console.log('u', user)

  // return (
  //   <div className="flex flex-col">
  //     <Button onClick={handleEMTMarketPlace}>test EMTMarketPlace</Button>
  //     <Button onClick={handleExpertToken}>test ExpertToken</Button>
  //     <Button onClick={handleMentorToken}>test MentorToken</Button>
  //   </div>
  // );

  return (
    <div className="grid grid-cols-6 col-span-4">
      <div className="h-full px-4 py-6 lg:px-6 col-span-4 lg:col-span-4 md:border-x">
        <ScrollArea className="h-[90vh] w-full">
          <div className="flex flex-col">
            <Tabs defaultValue="following" className="w-full">
              <TabsList>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
              <TabsContent value="following">
                <div className="flex flex-col gap-y-4 items-center">
                  {dummyPosts.map((post, key) => {
                    return <>
                      <PostCard key={`post-${key}`} data={post} />
                      <Separator className="bg-border w-[94%]" />
                    </>
                  })}
                </div>
              </TabsContent>
              <TabsContent value="design">
                <div className="flex flex-col gap-y-4 items-center">
                  {dummyPosts.map((post, key) => {
                    return <>
                      <PostCard key={`post-${key}`} data={post} />
                      <Separator className="bg-border w-[94%]" />
                    </>
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
      <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2" >
        <>

          <div className="mb-8">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Top Creators
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return <Link href={`/dapp/profile/${profile.username}`} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.avatar}
                        alt={`${profile.name}-avatar`}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.name}</p>
                        {profile.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
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
                return <Link href={`/dapp/profile/${profile.username}`} key={`top-creator-${key}`} className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                  <div className='flex items-center'>
                    <div className="w-10 h-10 relative">
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loading="eager"
                        src={profile.avatar}
                        alt={`${profile.name}-avatar`}
                        quality={80}
                      />
                    </div>
                    <div className='ml-3'>
                      <div className="flex items-center">
                        <p className='text-md text-foreground'>{profile.name}</p>
                        {profile.mentor === "true" && <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />}
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
        </>
      </RightSidebar>
    </div>


  );
}
