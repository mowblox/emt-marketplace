"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HiCheckBadge,
  HiOutlineCog6Tooth,
  HiOutlineFire,
  HiOutlineTicket,
  HiOutlineUserPlus,
  HiUser,
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
import ClaimHistoryItem from "./_components/claim-history-item";
import ClaimExptCard from "./_components/claim-expt-card";
import { Switch } from "@/components/ui/switch";
import ExptBookingsHistory from "./_components/expt-bookings-history";
import { ExpertTicket, UserProfile } from "@/lib/types";

const claimHistory = [{ type: 'ment', amount: 500, dateClaimed: "20 seconds ago" },
{ type: 'expt', amount: 5, dateClaimed: "20 minutes ago" },
{ type: 'expt', amount: 5, dateClaimed: "4 hours ago" },
{ type: 'ment', amount: 5, dateClaimed: "20 days ago" }]

const dummyUser: UserProfile = {
  uid: "string",
  displayName: "Lisa Brumm",
  tags: ["react", "ruby", "AI"],
  about: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
  isExpert: true,
  skill: "Ruby",
  level: 3,
  username: "@lisabrum",
  sessionStats: {
      sessions: 900,
      timeSpent: 4924,
  }
}

const dummyOtherExperts: ExpertTicket[] = [
  {
      price: 9,
      paymentCurrency: "USDT",
      metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 1,
          sessionDuration: 30,

      },
      author: dummyUser,
  },
  {
      price: 9,
      paymentCurrency: "USDT",
      metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 1,
          sessionDuration: 30,

      },
      author: dummyUser,
  },
  {
      price: 9,
      paymentCurrency: "USDT",
      metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 1,
          sessionDuration: 30,

      },
      author: dummyUser,
  },
  {
      price: 9,
      paymentCurrency: "USDT",
      metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 1,
          sessionDuration: 30,

      },
      author: dummyUser,
  },
  {
      price: 9,
      paymentCurrency: "USDT",
      metadata: {
          id: "eiwoi2424",
          imageURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          title: "Juno",
          description: "Aenean massa gravida mollis consectetur. Tempus auctor mattis in posuere mauris tincidunt pulvinar. Lorem volutpat auctor ultrices orci habitant vel fusce vel. Facilisis aliquet in est consequat sed cursus id. Ut nunc nisl id gravida. Lobortis morbi massa vestibulum lectus mauris lacus platea et. Blandit curabitur dignissim justo erat sed. At nullam metus iaculis massa nulla id aliquet pharetra. Malesuada condimentum iaculis turpis tristique lectus euismod. Urna maecenas nisl diam sagittis tempus rhoncus at.",
          sessionCount: 1,
          sessionDuration: 30,

      },
      author: dummyUser,
  }
]



const Profile = () => {
  const { uid } = useParams();
  const { user } = useUser();
  const { fetchProfile, followUser, unfollowUser, checkFollowing } = useBackend();
  const router = useRouter();

  const ready = !!(uid && user?.uid);
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
    enabled: !isCurrentUserProfile && ready,
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
  const { data: followers } = useQuery({
    queryKey: ["followers", uid],
    queryFn: () => fetchProfile(uid as string),
    enabled: !!uid,
  })


  console.log('profile', profile, "ready", ready)

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
              <div className="flex flex-col gap-y-4 mt-5">
                <div className="flex p-4 items-center justify-between bg-accent-shade rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center text-sm">
                      <HiOutlineFire className="w-4 h-4 ml-1 text-accent-3" />
                      <div className="ml-1 flex items-center text-muted">Unclaimed MENT: <span className="ml-1 text-foreground">1200</span></div>
                    </div>
                  </div>
                  <Button size="sm">Claim MENT</Button>
                </div>

                <ClaimExptCard />

                <h4 className="text-md text-foreground font-bold mb-5">
                  Claim History
                </h4>

                <div className="flex flex-col gap-7">
                  {claimHistory.map((claimItem, key) => (<ClaimHistoryItem key={`claim-item-${claimItem.type}-${key}`} claimItem={claimItem} />))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="status">
              <div className="flex flex-col gap-y-4 mt-5">
                <div className="flex p-4 items-center justify-between bg-accent-shade rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center text-sm">
                      <div className="ml-1 flex items-center text-muted">Are you available for mentoring?</div>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex flex-col gap-y-4 mt-5">
                <ExptBookingsHistory ownedExpt={dummyOtherExperts} />
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
