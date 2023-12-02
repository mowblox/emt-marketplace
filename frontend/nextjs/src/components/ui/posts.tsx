import { Content } from "@/lib/types";
import React from 'react'
import PostCard from './post-card';
import { Separator } from '@radix-ui/react-separator';
import { useUser } from "@/lib/hooks/user";
import { useIntersection } from "@mantine/hooks";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import PageLoading from './page-loading';
import DataLoading from './data-loading';
import useBackend from "@/lib/hooks/useBackend";
import { Timestamp } from "firebase/firestore";
import NoData from "./no-data";
import LoadingMore, { LoadingDone } from "./loading-more";


type Props = {
    filters?: {owner?:string, tags?:string[], isFollowing?:true},
}

export default function Posts ({filters}: Props) {
    const loadMoreRef = React.useRef<HTMLDivElement>(null);
    const {fetchPosts} = useBackend();
    
  
    const { entry, ref } = useIntersection({
      threshold: 0,
      // root: loadMoreRef.current
    });

    const {
      data: contentPages,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
      isLoading,
      error
    } = useInfiniteQuery({
      queryKey: ["posts", filters],
      queryFn: async ({ pageParam }) => {
        const contents = await fetchPosts(pageParam, 1, filters);
        return contents;
      },
      initialPageParam : undefined as unknown as Timestamp,
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1]?.post.timestamp;
      },
      select:(data)=>{
        return {
          pages:data.pages.flat(),
          pageParams:[data.pageParams.pop()]
        }
        }
    });
  
    // const posts =
    //   postPages?.pages?.flatMap((page, i) =>
    //     page.map((p, j) => ({ ...p, indexes: [i, j] }))
    //   ) || [];

    console.error("postsloading error:", error)
  
  if (hasNextPage && entry?.isIntersecting) {
    fetchNextPage();
  }
  
  if(!contentPages && isLoading) {
    return (<div className="h-screen">
        <DataLoading />
      </div>)
  }

  if(!contentPages?.pages[0] && !isLoading) {
    return (<div className="h-screen">
        <NoData message="No posts" />
      </div>)
  }

  console.log('contendData', contentPages)
  
  return (
    <>
      <div className="flex flex-col gap-y-4">
        {contentPages?.pages?.map((content: Content) => {
          return (
            <div className="" key={`post-${content.metadata.id}`}>
              <PostCard
                key={`post-${content.metadata.id}`}
                data={content}
              />
              <Separator className="bg-border mx-auto my-4 w-[94%] " />
            </div>
          );
        })}
      </div>

      <div ref={ref}>
        { isFetchingNextPage ? <LoadingMore />: <LoadingDone /> }
      </div>
    </>
  )
}