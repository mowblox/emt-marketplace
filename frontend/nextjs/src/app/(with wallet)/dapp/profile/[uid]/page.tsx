"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  HiCheckBadge,
  HiOutlineFire,
  HiOutlineUserPlus,
  HiUser,
} from "react-icons/hi2";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/hooks/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Posts from "@/components/ui/posts";
import useBackend from "@/lib/hooks/useBackend";
import { toast } from "@/components/ui/use-toast";
import { profilePlaceholderImage } from "@/lib/utils";
import DataLoading from "@/components/ui/data-loading";
import NoData from '@/components/ui/no-data';

const Profile = () => {
  const { uid } = useParams();
  const { user } = useUser();
  const { fetchProfile, followUser, fetchUnclaimedMent, claimMent, unfollowUser, checkFollowing } = useBackend();
  const router = useRouter();

  const isCurrentUserProfile = user?.uid === uid 
  
  //fetch profile
  const { data: profile} = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => fetchProfile(uid as string),
    throwOnError: (error)=>{ console.log(error); return false}
  });

  //check if following
  const {data: isFollowingUser, } = useQuery({
    queryKey: ["isFollowing", uid],
    queryFn: (v) => checkFollowing(uid as string),
    enabled: !isCurrentUserProfile && !!user?.uid,
  })
  
  const queryClient = useQueryClient();

  //follow/unfollow user
  const {mutateAsync} = useMutation( {
    mutationFn: ()=>  isFollowingUser? unfollowUser(profile?.uid!) :followUser(profile?.uid!),
    onSuccess: () => {
      queryClient.setQueryData(["isFollowing", uid], (OldfollowStatus : boolean)=>{
        return !OldfollowStatus;
      })
    },
    onError: (e: any) => {
      // Handle error state here
      console.error("oops!", e.message)
    },
  });

   async function toggleFollowing() {
    await mutateAsync();
    toast({
      title: isFollowingUser ? 'Unfollowed' : 'Followed',
      description: isFollowingUser ? 'You have unfollowed this user' : 'You have followed this user',
      variant: 'success',
    })

  }
  

  //fetch followers
  const { data: followers, isLoading } = useQuery({
    queryKey: ["followers", uid],
    queryFn: () => fetchProfile(uid as string),
    enabled: !!uid,
  })

  

  if (!profile && isLoading) {
    return (<div className="h-screen">
        <DataLoading />
      </div>)
  }

  if(!profile){
    return <div className="h-screen">
      <NoData message="Error Loading Profile"/>
    </div>
  }


  return (
    <div className="">
      <div className="space-y-5 mb-5">
        <div className="py-2 rounded-md flex w-full items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 relative">
              <Image
                fill
                className="rounded-full object-cover"
                loading="eager"
                src={profile.photoURL || profilePlaceholderImage}
                alt={`${profile.displayName}-photoURL`}
                quality={80}
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <p className="text-md text-foreground">{profile.displayName}</p>
                {profile.isExpert === true && (
                  <HiCheckBadge className="w-4 h-4 ml-1 text-accent-3" />
                )}
              </div>
              <Badge>{profile.skill || profile.tags?.[0]}</Badge>
            </div>
          </div>
            {!isCurrentUserProfile && <Button
              variant="ghost"
              onClick={toggleFollowing}
              className="text-xs hover:bg-transparent text-muted hover:text-accent-3 gap-2">
              {isFollowingUser ? <><HiUser className="" /> Following</> : <>
              <HiOutlineUserPlus /> Follow
              </> } 
            </Button>}
        </div>

        <div className="text-foreground text-sm">{profile.about}</div>

        <div className="w-full border-y">
          <div className="flex justify-start gap-4 items-center w-full py-5">
            <div className="flex items-center text-sm text-accent-3">
              <HiOutlineFire className="w-4 h-4 ml-1" />
              <div className="ml-1">{profile.ment} MENT</div>
            </div>

            <div className="flex items-center text-sm text-muted">
              <div className="ml-1">{profile.numFollowers} Followers</div>
            </div>

            <div className="flex items-center text-sm text-muted">
              <div className="ml-1">{profile.numFollowing} Following</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
          <div>
            <h3>Posts</h3>
            <Posts filters={{ owner: profile.uid }} />
          </div>
      </div>
    </div>
  );
};

export default Profile;
