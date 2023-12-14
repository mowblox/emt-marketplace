import React from "react";
import { useIntersection } from "@mantine/hooks";
import {
  useInfiniteQuery,
} from "@tanstack/react-query";
import DataLoading from "./data-loading";
import NoData from "./no-data";
import LoadingMore from "./loading-more";

type Props = {
  filters?: Record<string, any>;
  fetcher: (
    pageParam: any,
    size?: number,
    filters?: Record<string, any>
  ) => Promise<any>;
  queryKey: ReadonlyArray<unknown>;
  size?: number;
  getNextPageParam?: (lastpage: any) => any;
  ItemComponent: React.FunctionComponent<{ data: any }>;
  itemKey?: (data: any) => string;
  enabled?: boolean;
  max?: number;
  Separator?: React.ReactNode;
  noDataComponent?: React.ReactNode;
  loadingComonent?: React.ReactNode;
} & React.HtmlHTMLAttributes<HTMLDivElement>;

export default function InfiniteScroll({
  filters,
  fetcher,
  size,
  queryKey,
  ItemComponent,
  max,
  itemKey,
  getNextPageParam,
  enabled,
  Separator,
  noDataComponent,
  loadingComonent: loadingComponent,
  ...props
}: Props) {
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
    error,
  } = useInfiniteQuery({
    queryKey: [...queryKey, size, filters],
    queryFn: async ({ pageParam, meta }) => {
      console.log("querying", meta);
      filters = filters;
      const contents = await fetcher(pageParam, size, filters);
      return contents;
    },
    initialPageParam: undefined as any,
    getNextPageParam:
      getNextPageParam ||
      ((lastPage, allPages) => {
        if (max && allPages.length >= max) return undefined;
        return lastPage[lastPage.length - 1]?.timestamp;
      }),
    select: (data) => {
      return {
        pages: data.pages.flat(),
        pageParams: [data.pageParams.pop()],
      };
    },
    enabled,
  });

  // const posts =
  //   postPages?.pages?.flatMap((page, i) =>
  //     page.map((p, j) => ({ ...p, indexes: [i, j] }))
  //   ) || [];

  error && console.info(queryKey[0] + " loading error:", error);

  if (hasNextPage && entry?.isIntersecting) {
    fetchNextPage();
  }

  if (!contentPages && isLoading) {
    return (
      <div className="h-screen">
        <DataLoading />
      </div>
    );
  }

  if (!contentPages?.pages[0] && !isLoading) {
    return <NoData message={"No " + queryKey} />;
  }

  console.log(queryKey, contentPages);

  return (
    <>
      <div {...props}>
        {contentPages?.pages?.map((content: any) => {
          return (
            <>
              <ItemComponent
                key={itemKey?.(content) || content.id}
                data={content}
              />
              {Separator}
            </>
          );
        })}
      </div>

      <div ref={ref}>
        {isFetchingNextPage ? (
          noDataComponent ? (
            noDataComponent
          ) : loadingComponent ? (
            loadingComponent
          ) : (
            <LoadingMore />
          )
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
