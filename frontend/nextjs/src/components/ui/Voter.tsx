import React from "react";
import { Button } from "./button";
import { HiOutlineHandThumbDown, HiOutlineHandThumbUp } from "react-icons/hi2";
import { Content } from "@/lib/types";
import { QueryClient, useMutation } from "@tanstack/react-query";
import useBackend from "@/lib/hooks/useBackend";
import { useQueryClient } from "wagmi";

    export default function Voter({post}:{post:Content}) {
        const {voteOnPost} = useBackend();

        const { mutateAsync, data: votes  } = useMutation({
            mutationKey: ["vote", post.metadata.id],
            mutationFn: async (vote: {
              id: string;
              voteType: "upvote" | "downvote";
              owner: string;
            }) => {
              return await voteOnPost(vote.id, vote.voteType, vote.owner);
            },
            onSuccess: (data, variables, context) => {
              console.log("data", data, variables, context);
            },
          });
        
          async function handleVote(
            e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
          ) {
            const voteType = e.currentTarget.name as "upvote" | "downvote";
            const res = await mutateAsync({
              id: post.metadata.id,
              voteType,
              owner: post.author.uid,
            });
            console.log("res", res);
          }
      return (<div className='flex items-center'>
                        <div className="flex items-center">
                            <Button onClick={handleVote} name='upvote' variant="ghost" aria-label='Upvote a post' size="icon">
                                <HiOutlineHandThumbUp className="h-5 w-5 text-foreground" />
                            </Button>
                            <div className='text-sm text-foreground ml-1'>
                                {post.metadata.upvotes}
                            </div>
                            
                        </div>
                        <div className="flex items-center ml-2">
                            <Button onClick={handleVote} variant="ghost" aria-label='Downvote a post' name='downvote' size="icon">
                                <HiOutlineHandThumbDown className="h-5 w-5 text-foreground" />
                            </Button>
                        </div>
                    </div>);
    }
  
  