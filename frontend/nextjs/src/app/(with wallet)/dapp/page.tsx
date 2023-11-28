"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/ui/post-card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RightSidebar } from "../_components/right-sidebar";
import Image from "next/image";
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import useBackend from "@/lib/hooks/useBackend";
import Posts from "@/components/ui/posts";
import { useUser } from "@/lib/hooks/user";
import { PROFILE_PAGE } from "../_components/page-links";

const dummyPosts = [
  {
    author: {
      displayName: "Naval",
      photoURL:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      isExpert: true,
    },
    post: {
      title:
        "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image:
        "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago",
    },
  },
  {
    author: {
      displayName: "Naval",
      photoURL:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      isExpert: true,
    },
    post: {
      title:
        "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image:
        "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago",
    },
  },
  {
    author: {
      displayName: "Naval",
      photoURL:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      isExpert: true,
    },
    post: {
      title:
        "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image:
        "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago",
    },
  },
  {
    author: {
      displayName: "Naval",
      photoURL:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
      isExpert: true,
    },
    post: {
      title:
        "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",
      body: "Et pulvinar purus purus pharetra non lobortis nunc. Consectetur feugiat orci consectetur consectetur facilisi. Urna cursus risus nisl sit suscipit nunc sed id in. ",
      image:
        "https://images.unsplash.com/photo-1577100078279-b3445eae827c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    metadata: {
      upvotes: 435,
      downvotes: 23,
      permalink: "something.com",
      datePublished: "5hrs ago",
    },
  },
];

const topCreatorList = [
  {
    displayName: "Naval",
    uid: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: "false",
    skill: "UI Design",
    username: "naval",
    ment: 134,
  },
  {
    displayName: "vally",
    uid: "0x27486f33523DFB323ee47e8E4279269Be719Ec6A",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "Java",
    username: "vally",
    ment: 693,
  },
  {
    displayName: "opda",
    uid: "0x6435cE1AE109cEC3C7CCD03E851c43AaeD684Cc7",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "Ruby",
    username: "opda",
    ment: 953,
  },
  {
    displayName: "jack",
    uid: "0x27486f33523DFB323ee47e8E4279269Be719Ec6A",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "AI",
    username: "jack",
    ment: 422,
  },
];

export default function RootLayout() {
  const {user} = useUser();

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 col-span-1 md:col-span-4">
      <div className="h-full px-0 md:px-2 py-6 col-span-4 lg:col-span-4 md:border-x">
        <ScrollArea className="h-[90vh] w-full px-4 md:px-0">
          <div className="flex flex-col">
            <Tabs defaultValue="all" className="w-full px-2">
              <TabsList className="">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
               <Posts />
              </TabsContent>
              <TabsContent value="following">
              {user? <Posts filters={{isFollowing:true}}/>
              : <>Sign in to view posts from mentors you follow</>}
              </TabsContent>
              <TabsContent value="design">
                <Posts filters={{tags:["design"]}} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
      <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2">
        <>
          <div className="mb-8">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Top Creators
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return (
                  <Link
                    href={PROFILE_PAGE(profile.uid)}
                    key={`top-creator-${key}`}
                    className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative">
                        <Image
                          fill
                          className="rounded-full object-cover"
                          loading="eager"
                          src={profile.photoURL}
                          alt={`${profile.displayName}-photoURL`}
                          quality={80}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="text-md text-foreground">
                            {profile.displayName}
                          </p>
                          {profile.isExpert === true && (
                            <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />
                          )}
                        </div>
                        <Badge>{profile.skill}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted">
                      <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                      <div className="ml-1">245 MENT</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Who to Follow
            </h2>
            <div className="flex flex-col gap-y-0">
              {topCreatorList.map((profile, key) => {
                return (
                  <Link
                    href={`/dapp/profile/${profile.uid}`}
                    key={`top-creator-${key}`}
                    className="px-3 py-2 rounded-md flex w-full items-center justify-between hover:bg-accent-shade">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative">
                        <Image
                          fill
                          className="rounded-full object-cover"
                          loading="eager"
                          src={profile.photoURL}
                          alt={`${profile.displayName}-photoURL`}
                          quality={80}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="text-md text-foreground">
                            {profile.displayName}
                          </p>
                          {profile.isExpert === true && (
                            <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />
                          )}
                        </div>
                        <Badge>{profile.skill}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted">
                      <HiOutlineFire className="w-4 h-4 ml-1 text-muted" />
                      <div className="ml-1">245 MENT</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      </RightSidebar>
    </div>
  );
}

