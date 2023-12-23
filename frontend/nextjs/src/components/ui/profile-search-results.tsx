import { Content } from "@/lib/types";
import React from "react";
import ProfileSearchCard from "./profile-search-card";
import { Separator } from "@radix-ui/react-separator";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "./infinite-scroller";

type Props = {
  filters?: { owner?: string; tags?: string[]; isFollowing?: true };
};

export default function ProfileSearchResults({ filters }: Props) {
  const { fetchPosts } = useBackend();

  return (
    <InfiniteScroll
      itemKey={(data: Content) => data.metadata.id}
      noDataMessage="No profiles found. Please try later"
      ItemComponent={(props) => (
        <>
          <ProfileSearchCard {...props} />
          <Separator className="border border-alt-stroke mx-auto my-0 w-[94%] " />
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
