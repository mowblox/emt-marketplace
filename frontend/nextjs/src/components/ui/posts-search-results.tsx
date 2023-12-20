import { Content } from "@/lib/types";
import React from "react";
import PostSearchCard from "./post-search-card";
import { Separator } from "@radix-ui/react-separator";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "./infinite-scroller";

type Props = {
  filters?: { owner?: string; tags?: string[]; isFollowing?: true };
};

export default function PostsSearchResults({ filters }: Props) {
  const { fetchPosts } = useBackend();

  return (
    <InfiniteScroll
      itemKey={(data: Content) => data.metadata.id}
      ItemComponent={(props) => (
        <>
          <PostSearchCard {...props} />
          <Separator className="border border-alt-stroke mx-auto my-2 w-[94%] " />
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
