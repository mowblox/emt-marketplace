"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/useContracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RightSidebar } from "@/app/(with wallet)/_components/right-sidebar";
import Image from "next/image";
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import useBackend from "@/lib/hooks/useBackend";
import PostsSearchResults from "@/components/ui/posts-search-results";
import ProfileSearchResults from "@/components/ui/profile-search-results";


export default function SearchPage() {

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 col-span-1 md:col-span-4">
      <div className="h-full px-0 md:px-2 py-6 col-span-4 lg:col-span-4 md:border-x">
        <ScrollArea className="h-[90vh] w-full px-4 md:px-0">
          <div className="flex flex-col">
            <Tabs defaultValue="posts" className="w-full px-2">
              <TabsList className="">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                  <PostsSearchResults />
              </TabsContent>
              <TabsContent value="people">
                <ProfileSearchResults />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
      <RightSidebar className="hidden md:block min-h-[94vh] col-span-2 lg:col-span-2">
        <>
          {/* <div className="mb-8">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Top Creators
            </h2>
            <div className="flex flex-col gap-y-0">
                <UserList filters={{ment: "desc"}}/>
            </div>
          </div>

          <div className="">
            <h2 className="mb-1 text-md pl-3 font-semibold tracking-tight">
              Who to Follow
            </h2>
            <div className="flex flex-col gap-y-0">
              <UserList filters={{isNotFollowing: true }}/>
            </div>
          </div> */}
        </>
      </RightSidebar>
    </div>
  );
}

