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
import useBackend from "@/lib/hooks/useBackend";


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
    } = useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: async ({ pageParam }) => {
        const contents = await fetchPosts(pageParam, 1, filters);
        return contents;
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return lastPage[lastPage.length - 1]
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
  
    if (hasNextPage && entry?.isIntersecting) {
      fetchNextPage();
    }

    if(!contentPages) return <PageLoading/>
  
  return (
    <div className="flex flex-col gap-y-4 items-center">
    {contentPages?.pages?.map((content : Content) => {
      return (
        <>
          <PostCard
            key={`post-${content.metadata.id}`}
            data={content}
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
  )
}