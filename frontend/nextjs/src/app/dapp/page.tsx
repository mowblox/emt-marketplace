"use client";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/ui/post-card";
import { Separator } from "@/components/ui/separator";

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


export default function RootLayout() {
  const { EMTMarketPlace, ExpertToken, MentorToken } = useContracts();
  async function handleEMTMarketPlace() {
      const val = await EMTMarketPlace.downVoteWeight();
      alert(val);
  }

  console.log('dummy', dummyPosts)

  async function handleExpertToken() {
    const val = await ExpertToken.MINTER_ROLE();
    alert(val);
  }

  async function handleMentorToken() {
    const val = await MentorToken.decimals();
    alert(val);
  }

  // return (
  //   <div className="flex flex-col">
  //     <Button onClick={handleEMTMarketPlace}>test EMTMarketPlace</Button>
  //     <Button onClick={handleExpertToken}>test ExpertToken</Button>
  //     <Button onClick={handleMentorToken}>test MentorToken</Button>
  //   </div>
  // );

  return (
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
              <Separator className="bg-border w-[94%]"/>
            </>
          })}
          </div>
        </TabsContent>
        <TabsContent value="design">
        {/* <PostCard /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
