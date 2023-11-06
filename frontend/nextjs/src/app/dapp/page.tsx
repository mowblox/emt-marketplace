"use client";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/lib/hooks/contracts";
import React from "react";

export default function RootLayout() {
  const { EMTMarketPlace, ExpertToken, MentorToken } = useContracts();
  async function handleEMTMarketPlace() {
      const val = await EMTMarketPlace._DOWNVOTE_WEIGHT();
      alert(val);
  }

  async function handleExpertToken() {
    const val = await ExpertToken.MINTER_ROLE();
    alert(val);
  }

  async function handleMentorToken() {
    const val = await MentorToken.decimals();
    alert(val);
  }

  return (
    <div className="flex flex-col">
      <Button onClick={handleEMTMarketPlace}>test EMTMarketPlace</Button>
      <Button onClick={handleExpertToken}>test ExpertToken</Button>
      <Button onClick={handleMentorToken}>test MentorToken</Button>
    </div>
  );
}
