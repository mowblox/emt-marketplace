"use client";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/ui/post-card";


export default function RootLayout() {
  const { EMTMarketPlace, ExpertToken, MentorToken } = useContracts();
  async function handleEMTMarketPlace() {
      const val = await EMTMarketPlace.downVoteWeight();
      alert(val);
  }

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
      <Tabs defaultValue="following" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>
        <TabsContent value="following">
          <PostCard />
        </TabsContent>
        <TabsContent value="design">
        <PostCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
