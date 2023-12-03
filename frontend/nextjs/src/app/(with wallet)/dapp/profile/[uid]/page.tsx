"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HiCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineFire,
} from "react-icons/hi2";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/ui/post-card";
import { useUser } from "@/lib/hooks/user";
import PageLoading from "@/components/ui/page-loading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Posts from "@/components/ui/posts";
import useBackend from "@/lib/hooks/useBackend";
import { toast } from "@/components/ui/use-toast";
import { profilePlaceholderImage } from "@/lib/utils";
import { PROFILE_EDIT_PAGE } from "@/app/(with wallet)/_components/page-links";
import DataLoading from "@/components/ui/data-loading";

const Profile = () => {
  const { uid } = useParams();
  // const profile = {
  //   name: "Naval",
  //   photoURL: "https://images.unsplash.com/photo-1640960543409-dbe56ccc30e2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //   isExpert: true,
  //   skill: "UX Design",
  //   username: "naval",
  //   about: "I’m an experienced CEO. I applied for 1001 positions. This is what happened.",

  // }
  const { user } = useUser();
  const { fetchProfile, followUser, unfollowUser, checkFollowing } = useBackend();
  const router = useRouter();

  const ready = !!(uid && user?.uid);
  const isCurrentUserProfile = user?.uid === uid 
  
  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: () => fetchProfile(uid as string),
    enabled: !!uid,
  });


  const {data: isFollowingUser, } = useQuery({
    queryKey: ["isFollowing", uid],
    queryFn: (v) => checkFollowing(uid as string),
    enabled: !isCurrentUserProfile && ready,
  })
  
  console.log('user', user?.uid, 'uidparam', uid, 'isCurrentUserProfile', isCurrentUserProfile, 'isFollowingUser', isFollowingUser,)
  const queryClient = useQueryClient();

  const {mutateAsync} = useMutation( {
    mutationFn: ()=>  isFollowingUser? unfollowUser(profile?.uid!) :followUser(profile?.uid!),
    onSuccess: () => {
      queryClient.setQueryData(["isFollowing", uid], (OldfollowStatus : boolean)=>{
        return !OldfollowStatus;
      })
    },
    onError: () => {
      // Handle error state here
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


  if (!profile || !ready) {
    return (<div className="h-screen">
        <DataLoading />
      </div>)
  }
  console.log('profile', profile, user)

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
              {/*TODO: @od41  add follow icon */}
              {isFollowingUser ? "Unfollow" : "Follow" } 
            </Button>
          )}
        </div>

        <div className="text-foreground text-sm">{profile.about}</div>

        <div className="w-full border-y">
          <div className="flex justify-start gap-4 items-center w-full py-5">
            <div className="flex items-center text-sm text-accent-3">
              <HiOutlineFire className="w-4 h-4 ml-1" />
              <div className="ml-1">245 MENT</div>
            </div>

            <div className="flex items-center text-sm text-muted">
              <div className="ml-1">5300 Followers</div>
            </div>

            <div className="flex items-center text-sm text-muted">
              <div className="ml-1">244 Following</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {isCurrentUserProfile ? (
          <div>
            <h3>Posts</h3>
            <Posts filters={{ owner: profile.uid }} />
          </div>
        ) : (
          <Tabs defaultValue="my-posts" className="w-full">
            <TabsList>
              <TabsTrigger value="my-posts">My Posts</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="notification-settings">
                Notification Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-posts">
              <Posts filters={{ owner: profile.uid }} />
            </TabsContent>
            <TabsContent value="wallet">
              <div className="flex flex-col gap-y-4 mt-5">
                <h4 className="text-md text-foreground font-bold mb-5">
                  Wallet
                </h4>
              </div>
            </TabsContent>
            <TabsContent value="notification-settings">
              <div className="flex flex-col gap-y-4 mt-5">
                <h4 className="text-md text-foreground font-bold mb-5">
                  Notification Settings
                </h4>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Profile;
