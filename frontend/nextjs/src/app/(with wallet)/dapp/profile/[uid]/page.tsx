"use client";
import MyWallet from './_components/my-wallet';
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  HiCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineFire,
  HiOutlineUserPlus,
  HiUser,
} from "react-icons/hi2";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/hooks/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Posts from "@/components/ui/posts";
import useBackend from "@/lib/hooks/useBackend";
import { toast } from "@/components/ui/use-toast";
import { profilePlaceholderImage } from "@/lib/utils";
import { PROFILE_EDIT_PAGE } from "@/app/(with wallet)/_components/page-links";
import DataLoading from "@/components/ui/data-loading";
import ExptBookingsHistory from "./_components/expt-bookings-history";
import SetAvailabilityStatus from './_components/set-availability-status';
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
    enabled: !!uid,
    throwOnError: (error)=>{ console.log(error); return false}
  });

  //check if following
  const {data: isFollowingUser, } = useQuery({
    queryKey: ["isFollowing", uid],
    queryFn: (v) => checkFollowing(uid as string),
    enabled: !isCurrentUserProfile && !!user?.uid,
  })
  
  console.log('user', user?.uid, 'uidparam', uid, 'isCurrentUserProfile', isCurrentUserProfile, 'isFollowingUser', isFollowingUser,)
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

  
  console.log('profile', profile?.uid)

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
          {isCurrentUserProfile ? (
            <Button
              variant="ghost"
              onClick={() =>
                router.push(PROFILE_EDIT_PAGE(uid))
              }
              className="text-xs hover:bg-transparent text-muted hover:text-accent-3">
              <HiOutlineCog6Tooth className="w-4 h-4 mr-1 " />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={toggleFollowing}
              className="text-xs hover:bg-transparent text-muted hover:text-accent-3">
              {isFollowingUser ? <div><HiUser className="" /> Following</div> : <div>
              <HiOutlineUserPlus /> Follow
              </div> } 
            </Button>
          )}
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
        {isCurrentUserProfile ? (
          <Tabs defaultValue="my-posts" className="w-full">
            <TabsList>
              <TabsTrigger value="my-posts">My Posts</TabsTrigger>
              <TabsTrigger value="wallet">My Wallet</TabsTrigger>
              <TabsTrigger value="status">
                Status
              </TabsTrigger>
              <TabsTrigger value="history">
                Booking History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-posts">
              <h4 className="text-md text-foreground font-bold mb-5">
                Posts
              </h4>
              <Posts filters={{ owner: profile.uid }} />
            </TabsContent>
            <TabsContent value="wallet">
             <MyWallet profile={profile}/>
            </TabsContent>
            <TabsContent value="status">
              <div className="flex flex-col gap-y-4 mt-5">
                  <SetAvailabilityStatus />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex flex-col gap-y-4 mt-5">
                <ExptBookingsHistory/>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            <h3>Posts</h3>
            <Posts filters={{ owner: profile.uid }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
