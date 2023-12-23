"use client";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/forms/search";
import React from "react";
import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { ExpertTicket, ExptListing, UserProfile } from "@/lib/types";
import ExpertHubCard from "@/components/ui/expert-hub-card";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "@/components/ui/infinite-scroller";

const ExpertHub = () => {
  const { fetchExptListings } = useBackend();
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  return (
    <div className="col-span-4">
      <div className="flex justify-between items-center w-full mb-12">
        <Search
          className="w-auto lg:w-2/3"
          placeholder="Search by name or expert category"
        />
        <Button variant="outline">
          <HiMiniAdjustmentsVertical className="mr-1" />
          Filter
        </Button>
      </div>
      <InfiniteScroll
        className="w-full flex flex-wrap gap-4 flex-grow"
        fetcher={fetchExptListings}
        size={3}
        ItemComponent={ExpertHubCard}
        getNextPageParam={(lastPage) => {
          return lastPage[lastPage.length - 1]?.timestamp;
        }}
        queryKey={["exptListings"]}
        noDataMessage="No EXPT listings found. Please try later"
      />
    </div>
  );
};

export default ExpertHub;
