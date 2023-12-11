import { Content } from "@/lib/types";
import React, { Component } from 'react'
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
    filters?: Record<string, any>,
    fetcher: (pageParam: any, size: number, filters?: Record<string, any>)=>Promise<any>,
    queryKey: string[],
    size?: number,
    getNextPageParam: (lastpage: any)=>any
    ItemComponent: React.FunctionComponent<{data: any}>
    itemKey?:(data: any)=>string
} & React.HtmlHTMLAttributes<HTMLDivElement>

export default function InfiniteScroll ({filters, fetcher, size=1, queryKey, ItemComponent, itemKey, getNextPageParam, ...props}: Props) {
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
      queryKey: [...queryKey, size, filters],
      queryFn: async ({ pageParam }) => {
        const contents = await fetcher(pageParam, size, filters);
        return contents;
      },
      initialPageParam : undefined,
      getNextPageParam,
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

    error && console.info(queryKey[0]+ " loading error:", error)
  
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
        <NoData message={"No "+queryKey} />
      </div>)
  }

  console.log('contendData', contentPages)
  
  return (
    <>
      <div {...props}>
        {contentPages?.pages?.map((content:  any) => {
          return (
              <ItemComponent
              key={itemKey?.(content) || content.id}
                data={content}
              />
          );
        })}
      </div>

      <div ref={ref}>
        { isFetchingNextPage ? <LoadingMore />: <LoadingDone /> }
      </div>
    </>
  )
}