"use client";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/forms/search";
import React from "react";
import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { ExpertTicket, ExptListing, UserProfile } from "@/lib/types";
import ExpertHubCard from "@/components/ui/expert-hub-card";
import useBackend from "@/lib/hooks/useBackend";
import InfiniteScroll from "@/components/ui/infinite-scroller";

const HelpPage = () => {
  const { fetchExptListings } = useBackend();
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  return (
    <div className="col-span-4">
      faqs...
    </div>
  );
};

export default HelpPage;
