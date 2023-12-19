import React, { useState } from "react";
import { Button } from "./button";
import { HiHandThumbDown, HiHandThumbUp, HiOutlineHandThumbDown, HiOutlineHandThumbUp } from "react-icons/hi2";
import { Content } from "@/lib/types";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useBackend from "@/lib/hooks/useBackend";
import { toast } from "./use-toast";
import { useUser } from "@/lib/hooks/user";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import LoadingCircle from "./loading-circle";

export default function Voter({ post }: { post: Content }) {
  const { voteOnPost, fetchPostVotes } = useBackend();
  const { user } = useUser();
  const { openConnectModal } = useConnectModal();
  const queryClient = useQueryClient();

  type PostQueryKey = ["votes", string, string | undefined]

  const { data: votes } = useQuery({
    queryKey: ["votes", post.metadata.id, user?.uid] as PostQueryKey,
    queryFn: () => fetchPostVotes(post.metadata.id),
    refetchOnMount: true,
    initialData: user?.uid ? {
      upvotes: post.metadata.upvotes,
      downvotes: post.metadata.downvotes,
      userUpvoted: post.metadata.userUpvoted,
      userDownvoted: post.metadata.userDownvoted,
    }: undefined,
  });

  const { mutateAsync, error, isPending } = useMutation({
    mutationKey: ["vote", post.metadata.id],
    mutationFn: (vote: {
      id: string;
      voteType: "upvote" | "downvote";
      owner: string;
    }) => {
      return   voteOnPost(vote.id, vote.voteType, vote.owner);
    },
    onSuccess: (data, variables, context) => {
      console.log("data", data, variables, context);
      queryClient.setQueryData(["votes", post.metadata.id, user?.uid] as PostQueryKey, {
        upvotes: data!.upvotes,
        downvotes: data!.downvotes,
        userUpvoted: data!.userUpvoted,
        userDownvoted: data!.userDownvoted,
      });
    },
    throwOnError: false,
    onError:(error) => {
      console.log("vote error", error);
      return false;
    }
  });

  async function handleVote(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    const voteType = e.currentTarget.name as "upvote" | "downvote";
    const res = await mutateAsync({
      id: post.metadata.id,
      voteType,
      owner: post.author?.uid,
    });
    console.log("res", res);
  }
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <Button
        disabled= {isPending}
          onClick={handleVote}
          name="upvote"
          variant={"ghost"}
          aria-label="Upvote a post"
          size="icon">
            {
votes?.userUpvoted ?
          <HiHandThumbUp className="h-5 w-5 text-foreground" />:
          <HiOutlineHandThumbUp className="h-5 w-5 text-foreground" />
            }
        </Button>
        <div className="text-sm text-foreground ml-1">
          {isPending?
          <LoadingCircle/>:
          votes ? votes.upvotes - votes.downvotes : 0}
        </div>
      </div>
      <div className="flex items-center ml-2">
        <Button
        disabled= {isPending}
          onClick={handleVote}
          variant="ghost"
          aria-label="Downvote a post"
          name="downvote"
          size="icon">
{votes?.downvotes ?
          <HiHandThumbDown className="h-5 w-5 text-foreground" />:
          <HiOutlineHandThumbDown className="h-5 w-5 text-foreground" />
            }        </Button>
      </div>
    </div>
  );
}
