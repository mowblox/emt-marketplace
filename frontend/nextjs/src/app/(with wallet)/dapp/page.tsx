"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/useContracts";
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
import UserList from "../_components/user-List";

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
            <Tabs defaultValue="all-posts" className="w-full px-2">
              <TabsList className="">
                <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                {user && <TabsTrigger value="following">Following</TabsTrigger>}
                {/* <TabsTrigger value="design">Design</TabsTrigger> */}
              </TabsList>
              <TabsContent value="all-posts">
                  <Posts />
              </TabsContent>
              {user && <TabsContent value="following">
                <Posts filters={{ isFollowing: true }} />
              </TabsContent>}
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
          </div>
        </>
      </RightSidebar>
    </div>
  );
}

