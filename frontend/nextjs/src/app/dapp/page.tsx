"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/ui/post-card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RightSidebar } from "./_components/right-sidebar";
import Image from "next/image";
import { HiCheckBadge, HiOutlineFire } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@/lib/hooks/user";
import { useIntersection } from "@mantine/hooks";
import useBackend from "@/lib/hooks/useBackend";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: "false",
    skill: "UI Design",
    username: "naval",
    ment: 134,
  },
  {
    displayName: "Naval",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "Java",
    username: "naval",
    ment: 693,
  },
  {
    displayName: "Naval",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "Ruby",
    username: "naval",
    ment: 953,
  },
  {
    displayName: "Naval",
    photoURL:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D",
    isExpert: true,
    skill: "AI",
    username: "naval",
    ment: 422,
  },
];

export default function RootLayout() {
  const { EMTMarketPlace, ExpertToken, MentorToken } = useContracts();
  const { user, updateUser, isLoading } = useUser();
  const { fetchPosts, voteOnPost } = useBackend();
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const { entry, ref } = useIntersection({
    threshold: 0,
    // root: loadMoreRef.current
  });
  const {
    data: postPages,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const posts = await fetchPosts(pageParam, 1);
      return posts;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPage[lastPage.length - 1].post.timestamp;
    },
  });

  const posts =
    postPages?.pages?.flatMap((page, i) =>
      page.map((p, j) => ({ ...p, indexes: [i, j] }))
    ) || [];

  if (hasNextPage && entry?.isIntersecting) {
    fetchNextPage();
  }

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (vote: {
      id: string;
      voteType: "upvote" | "downvote";
      indexes: number[];
    }) => {
      return await voteOnPost(vote.id, vote.voteType);
    },
    onSuccess: (data, variables, context) => {
      console.log("data", data, variables, context);
      const [pageIndex, postIndex] = variables.indexes;

      queryClient.setQueryData(["posts"], (oldData: any) => {
        const newData = { ...oldData };
        const post = newData.pages[pageIndex][postIndex];
        post.metadata.upvotes = data.upvotes;
        post.metadata.downvotes = data.downvotes;
        console.log("old", oldData, "new", newData, "post", post);
        return newData;
      });
    },
  });

  async function handleVote(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    indexes: number[]
  ) {
    const voteType = e.currentTarget.name as "upvote" | "downvote";
    const [pageIndex, postIndex] = indexes;
    const res = await mutateAsync({
      id: postPages?.pages[pageIndex][postIndex].metadata.id!,
      voteType,
      indexes,
    });
    console.log("res", res);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 col-span-1 md:col-span-4">
      <div className="h-full px-0 md:px-2 py-6 col-span-4 lg:col-span-4 md:border-x">
        <ScrollArea className="h-[90vh] w-full px-4 md:px-0">
          <div className="flex flex-col">
            <Tabs defaultValue="following" className="w-full px-2">
              <TabsList className="">
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>
              <TabsContent value="following">
                <div className="flex flex-col gap-y-4 items-center">
                  {posts.map((post, index) => {
                    return (
                      <>
                        <PostCard
                          key={`post-${post.metadata.id}`}
                          handleVote={(
                            e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                          ) => handleVote(e, post.indexes)}
                          data={post}
                        />
                        <Separator className="bg-border w-[94%]" />
                      </>
                    );
                  })}
                  {}

                  <div ref={ref}>
                    {isFetchingNextPage ? "loading more..." : "done"}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="design">
                <div className="flex flex-col gap-y-4 items-center">
                  {dummyPosts.map((post, key) => {
                    return (
                      <>
                      {
                          // @ts-ignore
                        <PostCard key={`post-${key}`} data={post} />
                      }
                        <Separator className="bg-border w-[94%]" />
                        </>
                    );
                  })}
                </div>
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
                    href={`/dapp/profile/${profile.username}`}
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
                    href={`/dapp/profile/${profile.username}`}
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
