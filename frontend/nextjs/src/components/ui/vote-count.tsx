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

export default function VoteCount({ post }: { post: Content }) {
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
  return (
    <div className="text-sm text-muted mt-3">
          {isPending?
          <LoadingCircle/>:
          votes ? votes.upvotes + votes.downvotes : 0} votes
        </div>
  );
}
