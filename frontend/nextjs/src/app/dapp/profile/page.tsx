"use client"
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { HiCheckBadge, HiOutlineHandThumbUp, HiOutlineHandThumbDown, HiOutlineShare, HiOutlineCog6Tooth, HiOutlineFire } from 'react-icons/hi2'
import Image from "next/image"
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PostCard from '@/components/ui/post-card'



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

const Profile = () => {
    const profile = {
        name: "Naval",
        avatar: "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        mentor: "true",
        skill: "UX Design",
        about: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",

    }

    return (
        <div className=''>
            <div className="space-y-5 mb-5">
                <div className="py-2 rounded-md flex w-full items-center justify-between">
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
                    <Button variant="ghost" className='text-xs hover:bg-transparent text-muted hover:text-accent-3'>
                        <HiOutlineCog6Tooth className="w-4 h-4 mr-1 " />
                        Edit Profile
                    </Button>
                </div>

                <div className="text-foreground text-sm">
                    {profile.about}
                </div>

                <div className="w-full border-y">
                    <div className="flex justify-start gap-4 items-center w-full py-5">
                        <div className="flex items-center text-sm text-accent-3">
                            <HiOutlineFire className="w-4 h-4 ml-1" />
                            <div className="ml-1">
                                245 MENT
                            </div>
                        </div>

                        <div className="flex items-center text-sm text-muted">
                            <div className="ml-1">
                                5300 Followers
                            </div>
                        </div>

                        <div className="flex items-center text-sm text-muted">
                            <div className="ml-1">
                                244 Following
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <Tabs defaultValue="my-posts" className="w-full">
                    <TabsList>
                        <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                        <TabsTrigger value="wallet">Wallet</TabsTrigger>
                        <TabsTrigger value="notification-settings">Notification Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-posts">
                        <div className="flex flex-col gap-y-4 items-center">
                            {dummyPosts.map((post, key) => {
                                return <>
                                    <PostCard key={`post-${key}`} data={post} />
                                    <Separator className="bg-border w-[94%]" />
                                </>
                            })}
                        </div>
                    </TabsContent>
                    <TabsContent value="wallet">
                        <div className="flex flex-col gap-y-4 mt-5">
                            <h4 className='text-xl text-foreground font-bold mb-5'>Wallet</h4>
                        </div>
                    </TabsContent>
                    <TabsContent value="notification-settings">
                        <div className="flex flex-col gap-y-4 mt-5">
                            <h4 className='text-xl text-foreground font-bold mb-5'>Notification Settings</h4>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    )
}

export default Profile