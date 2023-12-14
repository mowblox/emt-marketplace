import { Content } from "@/lib/types";
import React from "react";
import PostCard from "./post-card";
import { Separator } from "@radix-ui/react-separator";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "./infinite-scroller";

type Props = {
  filters?: { owner?: string; tags?: string[]; isFollowing?: true };
};

export default function Posts({ filters }: Props) {
  const { fetchPosts } = useBackend();

  return (
    <InfiniteScroll
      itemKey={(data: Content) => data.metadata.id}
      ItemComponent={(props) => (
        <>
          <PostCard {...props} />
          <Separator className="bg-border mx-auto my-4 w-[94%] " />
        </>
      )}
      getNextPageParam={(lastPage) => {
        return lastPage[lastPage.length - 1]?.post.timestamp;
      }}
      queryKey={["posts"]}
      filters={filters}
      fetcher={fetchPosts}
      className="flex flex-col gap-y-4"
    />
  );
}
