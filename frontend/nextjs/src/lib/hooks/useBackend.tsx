"use client";
import {
  POST_PAGE,
  PROFILE_PAGE,
} from "@/app/(with wallet)/_components/page-links";
import {
  Booking,
  BookingFilters,
  BuiltNotification,
  ClaimHistoryItem,
  Coin,
  Content,
  ExptFilters,
  ExptListing,
  ExptListingWithAuthorProfile,
  NewExptListing,
  NotificationData,
  PostFilters,
  PostVotes,
  ProfileFilters,
  SignUpData,
  UserProfile,
  userUpdateValidationResult,
} from "@/lib/types";
import { UseQueryResult, useQueries, useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
} from "ethers6";
import {
  increment,
  arrayRemove,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  documentId,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  BOOKINGS_COLLECTION,
  CLAIM_HISTORY_COLLECTION,
  CONTENTS_COLLECTION,
  EXPT_LISTINGS_COLLECTION,
  NOTIFICATIONS_COLLECTION,
  USERS_COLLECTION,
  exptLevelKeys,
  chain
} from "../../../emt.config";
import { firestore, storage } from "../firebase";
import { useContracts } from "./useContracts";
import { useUser } from "./user";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { Progress } from "@/components/ui/progress";

// toast({
//   title: "Profile updated!",
//   description: <div>
//     <Progress value={43} className="h-2 mt-2 w-full text-accent-4 bg-accent-shade" />
//   </div>,
//   duration: Infinity
// });
//toast setup
function loadingToast( message: string, stage?: number | undefined, error?: boolean )  {
  const t = toast({
    title: message,
    variant: "default",
    description: (
      stage !== undefined ? <div>
        <Progress
          value={stage}
          className="h-2 mt-2 w-full text-accent-4 bg-accent-shade"
        />
      </div> : undefined
    ),
    duration: (stage !== undefined  && stage !== 100) && !error ? Infinity :3100
  });
  return ( newMessage: string, stage?: number | undefined , error?: boolean ) =>
    t.update({
      id: t.id,
      title: newMessage || message,
      description: (
        stage !== undefined ? <div>
          <Progress
            value={stage}
            className="h-2 mt-2 w-full text-accent-4 bg-accent-shade"
          />
        </div> : undefined
      ),
      variant: error ? "destructive" : stage === 100 ? "success" : "default",
      duration: (stage !== undefined  && stage !== 100) && !error ? Infinity : 3000
    })
}
/**
 * Uploads an image to Firebase Storage.
 * @param image - The image to upload.
 * @param name - The name of the image.
 * @param subpath - The subpath to store the image in.
 * @returns The URL of the uploaded image.
 */
export async function uploadImage(image: Blob, name: string, subpath?: string) {
  const storageRef = ref(storage, `images/${subpath || ""}/${name}`);
  const uploadResult = await uploadBytes(storageRef, image);
  const imageURL = await getDownloadURL(uploadResult.ref);
  console.log("File available at", imageURL);
  return imageURL;
}

/**
 * Custom hook for backend operations.
 * @returns An object containing functions for creating posts, updating profiles, fetching user posts, fetching posts, and voting on posts.
 */
export default function useBackend() {
  const { emtMarketplace, mentorToken, expertToken, network, stableCoin, provider } =
    useContracts();
  const { user } = useUser();
  const { update } = useSession();
  const [signer, setSigner] = useState<ethers.Signer>();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const wrongChain =  Number(network?.chainId) !== chain.id;

  //queries
  const { data: exptLevels } = useQuery({
    queryKey: ["exptlevels"],
    queryFn: async () => {
      const levelsPromises = exptLevelKeys.map((key) =>
        emtMarketplace.exptLevels(key)
      );
      const levels = await Promise.all(levelsPromises);
      return levels;
    },
    throwOnError: (error) => {
      console.log("error fetching Levels ", error);
      return false;
    },
    //TODO: store expt levels in firestore and remove this enabled check
    enabled: !wrongChain,
  });
  const tokens: Coin[] = [
    { address: stableCoin.target as string, type: "erc20", name: "USDT" },
    { name: "MENT", type: "erc20", address: mentorToken.target as string },
    { name: "EXPT", type: "erc721", address: expertToken.target as string },
    { name: chain.nativeCurrency.symbol, type: "native", address: "0x0" },
  ];
  const { balances, isFetchingBalances, refetchBalances, balancesError } =
    useQueries({
      queries: tokens.map((token) => ({
        queryKey: ["balances", token.name, user?.uid],
        queryFn: async () => {
          const currentUserId = user?.uid!;
          if (token.type === "native")
            return {
              [token.name]: parseFloat(
                ethers.formatEther(await provider.getBalance(currentUserId))
              ).toFixed(2),
            };
          const contract = stableCoin.attach(
            token.address!
          ) as typeof stableCoin;
          const balance = await contract.balanceOf(currentUserId);
          return {
            [token.name]: parseFloat(ethers.formatUnits(balance, 6)).toFixed(2),
          };
        },
        enabled: !wrongChain && !!user?.uid,
      })),
      combine: (allResults) => {
        return {
          balances: allResults.reduce(
            (acc, result) => ({ ...acc, ...result.data }),
            {} as Record<
              "USDT" | "MENT" | "EXPT" | typeof chain.nativeCurrency.symbol,
              number
            >
          ),
          pending: allResults.some((result) => result.isPending),
          balancesError: allResults.find((result) => result.error),
          isFetchingBalances: allResults.some((result) => result.isFetching),
          refetchBalances: (coin?: "USDT" | "MENT" | "EXPT" | "native") =>
            coin
              ? allResults
                  .find(
                    (res) =>
                      res.data?.[
                        coin === "native" ? chain.nativeCurrency.name : coin
                      ] !== undefined
                  )
                  ?.refetch()
              : Promise.all(allResults.map((result) => result.refetch())),
        };
      },
    });

  async function createNotification(data: Partial<NotificationData>) {
    console.log("createNotification", data);
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    //create notification in firestore
    data.isRead = false;
    data.timestamp = serverTimestamp();
    data.sender = data.sender || user.uid;
    const docRef = doc(NOTIFICATIONS_COLLECTION);
    await setDoc(docRef, data);
  }
  async function saveClaimHistoryItemToFirestore(
    item: Omit<ClaimHistoryItem, "timestamp" | "id">
  ) {
    try {
      const docRef = doc(CLAIM_HISTORY_COLLECTION);
      const itemWithTimestamp = { ...item, timestamp: serverTimestamp() };
      await setDoc(docRef, itemWithTimestamp);
      return { ...item, id: docRef.id, timestamp: Timestamp.now() };
    } catch (err: any) {
      console.log(
        `Error saving ${item.type} claim history item to firestore. Message: ` +
          err
      );
      throw new Error(
        "Error saving claim history item to firestore. Message: " + err.message
      );
    }
  }
  async function updateUserMentInFirestore() {
    try {
      console.log("updating ment in firestore through nextjs server");
      const ses = (await update({ updateMent: true })) as unknown as {
        error: any;
        newMent: number;
      };
      console.log("updated ment in firestore", ses);
      const { error, newMent } = ses;
      if (error) throw new Error(error);
      return newMent;
    } catch (err: any) {
      console.log("error saving ment to firestore");
      throw new Error(err);
    }
  }
  async function claimMent() {
    function getMentClaimed(receipt: ContractTransactionReceipt) {
      const filter = emtMarketplace.filters.MentClaimed().fragment;
      let mentClaimed = 0;
      // console.log(receipt?.logs)
      receipt?.logs.some((log) => {
        const d = emtMarketplace.interface.decodeEventLog(filter, log.data);
        console.log("l", d);
        mentClaimed = Number(d[1]);
        return false;
      });
      console.log("mentClaimed", mentClaimed);
      return mentClaimed;
    }
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const tx = await emtMarketplace.claimMent();
      const receipt = await tx!.wait();
      console.log("claimed ment");
      // @ts-ignore
      const mentClaimed = getMentClaimed(receipt);
      const historyItem: Omit<ClaimHistoryItem, "id" | "timestamp"> = {
        type: "ment",
        amount: mentClaimed,
        uid: user.uid,
      };
      const claimHistoryItem =
        await saveClaimHistoryItemToFirestore(historyItem);
      const newMent = await updateUserMentInFirestore();
      return { mentClaimed, newMent, claimHistoryItem };
    } catch (err: any) {
      console.log(err);
      throw new Error("Error claiming ment. Message: " + err.message);
    }
  }

  async function fetchMentAndLevel(uid = user?.uid): Promise<[number, number]> {
    console.log("fetchMentAndLevel", uid);
    let ment = 0;
    if (uid !== user?.uid) {
      ment = await fetchMent(uid);
    }
    console.log("ment2222: ", ment);
    const level = exptLevels
      ? Object.entries(exptLevels).find(
          ([key, level]) => (ment || 0) > level.requiredMent
        )?.[0] || 0
      : 0;
    console.log("level: ", level);
    return [Number(ment), Number(level)];
  }

  async function claimExpt() {
    function getExptClaimed(receipt: ContractTransactionReceipt) {
      const filter = emtMarketplace.filters.ExptClaimed().fragment;
      let exptClaimed = 0;
      // console.log(receipt?.logs)
      receipt?.logs.some((log) => {
        const d = emtMarketplace.interface.decodeEventLog(filter, log.data);
        console.log("l", d);
        exptClaimed = Number(d[1]);
        return false;
      });
      console.log("exptClaimed", exptClaimed);
      return exptClaimed;
    }
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const [_, level] = await fetchMentAndLevel();

      if (!level) {
        throw new Error("Not qualified for expt");
      }
      const tx = await emtMarketplace.claimExpt(level);
      const receipt = await tx!.wait();
      const val = await expertToken.balanceOf(user.uid);
      const newExptBalance = Number(val);
      const exptClaimed = getExptClaimed(receipt!);

      const historyItem: Omit<ClaimHistoryItem, "timestamp" | "id"> = {
        type: "expt",
        amount: exptClaimed,
        level: level,
        uid: user.uid,
      };
      const claimHistoryItem =
        await saveClaimHistoryItemToFirestore(historyItem);
      console.log("claimed expt. New expt balance: ", newExptBalance);
      return { newExptBalance, claimHistoryItem };
    } catch (err: any) {
      console.log(err);
      throw new Error("Error claiming ment. Message: " + err.message);
    }
  }

  async function fetchVotesAndUsernames(notifications: BuiltNotification[]) {
    console.log("fetchVotesAndUsernames", notifications);
    const fetchPromises = notifications.map(async (notification) => {
      if (!notification.isNew) return notification;

      const userDocRef = doc(USERS_COLLECTION, notification.sender);
      const userDoc = await getDoc(userDocRef);
      const user = userDoc.data() as UserProfile;
      notification.username = user.username!;
      notification.photoURL = user.photoURL!;

      if (notification.type === "upvote" || notification.type === "downvote") {
        const contentDocRef = doc(CONTENTS_COLLECTION, notification.contentId!);
        const contentDoc = await getDoc(contentDocRef);
        const content = contentDoc.data() as Content["post"];
        notification.message = content.title;

        const [upvotes, downvotes, netVotes] =
          await emtMarketplace.contentVotes(
            ethers.encodeBytes32String(notification.contentId!)
          );
        notification.votes = Number(
          notification.type === "upvote" ? upvotes : downvotes
        );
      }
      return notification;
    });

    const finalNotifications = await Promise.all(fetchPromises);
    return finalNotifications;
  }

  async function buildNotifications(
    notifications: QueryDocumentSnapshot[],
    oldNotifications?: BuiltNotification[]
  ) {
    console.log("buildNotifications", notifications);
    const newNofications = notifications.reduce((acc, doc) => {
      const notification = doc.data() as BuiltNotification;
      let notifToBuildIndex = acc.findIndex(
        (notif) =>
          notif.type === notification.type &&
          notif.contentId === notification.contentId
      );

      let notifToBuild =
        notifToBuildIndex > -1 ? { ...acc[notifToBuildIndex] } : notification;
      console.log("notitob:", notifToBuild);
      if (notifToBuildIndex > -1) {
        notifToBuild.others++;
        notifToBuild.datePublished = formatDistance(
          notifToBuild.timestamp.toDate(),
          new Date(),
          { addSuffix: false }
        );
        notifToBuild.ids.push(doc.id);
      } else {
        notifToBuild = notification;
        notifToBuild.others = 0;
        notifToBuild.ids = [doc.id];
        notifToBuild.href = notification.contentId
          ? POST_PAGE(notification.contentId)
          : PROFILE_PAGE(notification.sender);
      }

      if (notifToBuild.type === "follow") {
        notifToBuild.summary = ` ${
          notifToBuild.others ? "and " + notifToBuild.others + " others" : ""
        } started following you`;
      }
      if (notifToBuild.type === "upvote" || notifToBuild.type === "downvote") {
        notifToBuild.summary = ` ${
          notifToBuild.others ? "and " + notifToBuild.others + " others" : ""
        }  ${notifToBuild.type}d your post`;
      }
      notifToBuild.isNew = true;
      acc[notifToBuildIndex > -1 ? notifToBuildIndex : acc.length] =
        notifToBuild;
      return acc;
    }, oldNotifications || []);

    return await fetchVotesAndUsernames(newNofications);
  }

  async function fetchNotifications(
    lastDocTimeStamp?: Timestamp,
    size = 20,
    oldNotifications?: BuiltNotification[]
  ): Promise<BuiltNotification[]> {
    if (user?.uid === undefined) return [];
    // fetch notifications from firestore
    let q = query(
      NOTIFICATIONS_COLLECTION,
      orderBy("timestamp", "desc"),
      where("recipients", "array-contains-any", [user?.uid, "all"]),
      limit(size)
    );
    if (lastDocTimeStamp) {
      q = query(q, startAfter(lastDocTimeStamp));
    }
    const querySnapshot = await getDocs(q);

    const notifications = await buildNotifications(
      querySnapshot.docs,
      oldNotifications
    );

    return notifications;
  }
  /**
   * Fetches the metadata of a post.
   * @param owner - The owner of the post.
   * @param id - The ID of the post as stored in Firestore.
   * @returns The author and metadata of the post.
   */
  async function fetchPostMetadata(owner: string, id: string) {
    const userDocRef = doc(USERS_COLLECTION, owner);
    const userDoc = await getDoc(userDocRef);
    const author = userDoc.data() as Content["author"];
    const votes = await fetchPostVotes(id);

    return {
      author,
      metadata: {
        ...votes,
        id,
      },
    };
  }

  async function fetchSinglePost(id: string) {
    const docRef = doc(CONTENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const post = docSnap.data() as Content["post"];
      const { author, metadata } = await fetchPostMetadata(
        post.owner,
        docSnap.id
      );
      return { post, author, metadata };
    } else {
      throw new Error("No such document!");
    }
  }
  async function fetchSingleListing(id: string) {
    const docRef = doc(EXPT_LISTINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const listing = docSnap.data() as ExptListingWithAuthorProfile;
      listing.id = docSnap.id;
      listing.authorProfile = await fetchProfile(listing.author);
      return listing;
    } else {
      throw new Error("Error Fetching Listing " + id);
    }
  }

  async function fetchNumFollowers(id: string) {
    const userFollowersRef = collection(USERS_COLLECTION, id, "followers");
    const querySnapshot = await getCountFromServer(query(userFollowersRef));
    const count = querySnapshot.data().count;
    console.log("fetchNumFollowers", count);
    return count;
  }

  async function fetchNumFollowing(id: string) {
    const q = query(
      collectionGroup(firestore, "followers"),
      where("uid", "==", id)
    );
    const querySnapshot = await getCountFromServer(q);
    const count = querySnapshot.data().count;
    console.log("fetchNumFollowing", count);
    return count;
  }

  async function fetchUserDoc(id: string) {
    console.log("fetching user doc", id);
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data() as UserProfile;
    data && (data.uid = id);
    console.log("fetched user doc");
    return data;
  }

  async function fetchMent(address = user?.uid) {
    console.log("fetching ment", address);
    try {
      const val = await mentorToken.balanceOf(address!);
      const ment = Number(val);
      console.log("ment:", ment);
      return ment;
    } catch (err: any) {
      console.log("Error fetching ment. Details: " + err);
      return 0;
    }
  }
  async function fetchUnclaimedMent() {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      console.log("unclaimed ment fetching");
      const val = await emtMarketplace.unclaimedMent(user.uid);
      console.log("unclaimed ment:", val);
      const unclaimedMent = Number(val);
      return unclaimedMent;
    } catch (err: any) {
      console.log("Error fetching unclaimed ment. Details: " + err);
      return 0;
    }
  }

  async function fetchUnclaimedExpt() {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      console.log("fetching unclaimed expt");
      const [_, level] = await fetchMentAndLevel();
      const val = await emtMarketplace.unclaimedExpt(user.uid, level || 1);
      const unclaimedExpt = Number(val);
      console.log("unclaimed expt:", unclaimedExpt);
      return unclaimedExpt;
    } catch (err: any) {
      if (
        err.message.includes("Not qualified for level") ||
        err.message.includes("Level has already been claimed")
      ) {
        return 0;
      } else {
        console.log("Error fetching expt. Details: " + err);
        throw new Error(err);
      }
    }
  }

  async function fetchProfile(
    uid: string,
    exclude?: {
      followers?: boolean;
      following?: boolean;
      ownedExptIds?: boolean;
    }
  ) {
    try {
      const promises: Promise<any>[] = [
        fetchUserDoc(uid),
        fetchMentAndLevel(uid),
      ];
      if (!exclude?.followers) promises.push(fetchNumFollowers(uid));
      if (!exclude?.following) promises.push(fetchNumFollowing(uid));
      if (!exclude?.ownedExptIds) promises.push(fetchOwnedExptIds(uid));

      const [userDoc, [ment, level], numFollowers, numFollowing, ownedExptIds] =
        await Promise.all(promises);

      const profile: UserProfile = {
        ...userDoc,
        level,
        numFollowers,
        numFollowing,
        ownedExptIds,
        ment,
        email: user?.email,
      };

      console.log("fetched Profile", profile.uid);
      return profile;
    } catch (err: any) {
      console.log("Error fetching profile. Details: " + err);
      throw new Error(err);
    }
  }

  /**
   * Fetches posts from the database.
   * @param lastDocTimeStamp - The timestamp of the last document.
   * @param size - The number of posts to fetch.
   * @returns An array of fetched posts.
   */
  async function fetchPosts(
    lastDocTimeStamp?: Timestamp,
    size = 1,
    filters?: PostFilters
  ): Promise<Content[]> {
    let q = query(
      CONTENTS_COLLECTION,
      orderBy("timestamp", "desc"),
      limit(size)
    );

    if (lastDocTimeStamp) {
      q = query(q, startAfter(lastDocTimeStamp));
    }
    if (filters?.tags) {
      q = query(q, where("tags", "array-contains-any", filters.tags));
    }
    if (filters?.owner) {
      q = query(q, where("owner", "==", filters.owner));
    }
    if (filters?.isFollowing) {
      q = query(q, where("owner", "in", filters.isFollowing));
    }

    console.log("postFilters", filters);

    const querySnapshot = await getDocs(q);

    const promises = querySnapshot.docs.map(async (doc) => {
      const post = doc.data() as Content["post"];
      const { author, metadata } = await fetchPostMetadata(post.owner, doc.id);
      return { post, author, metadata };
    });
    const posts: Content[] = await Promise.all(promises);
    return posts;
  }

  /**
   * Creates a new post.
   * @param post - The post data.
   * @returns An object containing the ID of the created post as stored in Firestre and the image URL.
   * @throws Error if there is an error writing to the blockchain or the database.
   */
  async function createPost(post: {
    title: string;
    body: string;
    image?: Blob;
    postType: string;
    questionPostURL?: string;
    tags?: string[];
  }) {
    if(!user?.uid){
      toast({
        title: "Login",
        description: "Please login to create a post",
      })
      throw new Error("User not logged in");
    }

    const t = loadingToast("Creating Post", 1);
    const docRef = doc(CONTENTS_COLLECTION);
    const id = ethers.encodeBytes32String(docRef.id);
    console.log("writing to blockchain", post, "pstId", id);
    try {
      console.log("emtMarketplace", emtMarketplace);
      const tx = await emtMarketplace.addContent(id);
      t("Mining transaction", 30);
      const receipt = await tx.wait();

      console.log("Content added to blockchain. Receipt:", receipt);
    } catch (err: any) {
      console.log("Error writing to blockchain. Details: " + err.message);
      throw new Error("Error writing to blockchain. Details: " + err.message);
    }
    let imageURL = "";
    t("Almost there...", 50);
    if (post.image) {
      try {
        console.log("uploading image");
        imageURL = await uploadImage(post.image, docRef.id, "contentImages");
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }
    t("", 80)
    try {
      console.log("writing to database");
      await setDoc(docRef, {
        title: post.title,
        body: post.body,
        owner: user?.uid,
        imageURL: imageURL,
        postType: post.postType,
        questionPostURL: post.questionPostURL,
        tags: post.tags,
        timestamp: serverTimestamp(),
      });
      t("Post Created successfully", 100)
    } catch (err: any) {
      t("Error creating post", 0, true)
      throw new Error("Error writing to database. Details: " + err.message);
    }
    console.log("Document written with ID: ", docRef.id);
    return { id: docRef.id, imageURL };
  }

  /**
   * wip
   * Fetches posts owned by the current user.
   * @returns An array of user posts.
   */
  async function fetchUserPosts() {
    if (!user) {
      return [];
    }
    const querySnapshot = await getDocs(
      query(CONTENTS_COLLECTION, where("owner", "==", user.uid))
    );
    const _posts = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });

    return _posts;
  }

  /**
   * Votes on a post.
   * @param id - The ID of the post as stored in firestore.
   * @param voteType - The type of vote ("upvote" or "downvote").
   * @returns The updated vote count.
   * @throws Error if there is an error voting on the content.
   * @fires createNotification
   */
  async function voteOnPost(
    id: string,
    voteType: "upvote" | "downvote",
    owner: string
  ): Promise<PostVotes> {
    if (!user?.uid) {
      toast({
        title: "Login",
        description: "Please login to vote",
      });
      openConnectModal?.();
      throw new Error("User not logged in");
    }
    const t = loadingToast("Processing vote", 1);
    const contentId = ethers.encodeBytes32String(id);
    let tx: ContractTransactionResponse;
    const isUpvote = voteType === "upvote";
    try {
      if (isUpvote) {
        tx = await emtMarketplace.upVoteContent(contentId);
      } else if (voteType === "downvote") {
        tx = await emtMarketplace.downVoteContent(contentId);
      }
      t('Mining transaction', 30);
      await tx!.wait();
      t('Almost done', 70)
      const [_upvotes, _downvotes] =
        await emtMarketplace.contentVotes(contentId);
      console.log("voted. New votes: ", {
        upvotes: _upvotes,
        downvotes: _downvotes,
      });

      createNotification({
        type: voteType,
        contentId: id,
        recipients: [user.uid],
      });
      t("Vote SuccessFul", 100)
      return { upvotes: Number(_upvotes), downvotes: Number(_downvotes), userDownvoted: !isUpvote, userUpvoted: isUpvote };
    } catch (err: any) {
      console.log(err);
      if(err.message.includes("Member has already up voted")){
        t("You have already upvoted this post", undefined, true)
      }else
      if(err.message.includes("Member has already down voted")){
        t("You have already downvoted this post", undefined, true)
      }else
      if(err.message.includes("Cannot Vote Again Due to Claim Rules")){
        t("You cannot change your vote", undefined, true)
      }else 
      t("Error Voting on Post", undefined , true);
      throw new Error("Error voting on content. Message: " + err.message);
    }
  }

  async function followUser(id: string) {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const userFollowersRef = doc(
        USERS_COLLECTION,
        id,
        "followers",
        user?.uid!
      );
      //check if is already following
      //TODO: @Jovells enforce this at rules level and remove this check to avoid extra roundrtip to db
      if (await checkFollowing(id)) return false;

      await setDoc(userFollowersRef, { timestamp: serverTimestamp() });

      createNotification({ type: "follow", recipients: [id] });

      return true;
    } catch (err: any) {
      throw new Error("Error following user. Message: " + err.message);
    }
  }

  async function unfollowUser(id: string) {
    try {
      const userFollowersRef = doc(
        USERS_COLLECTION,
        id,
        "followers",
        user?.uid!
      );
      //check if is already following
      //TODO: @Jovells enforce this at rules level and remove this check to avoid extra roundrtip to db
      if (await checkFollowing(id)) return false;

      await deleteDoc(userFollowersRef);
      return true;
    } catch (err: any) {
      throw new Error("Error unfollowing user. Message: " + err.message);
    }
  }
  async function listExpts(listing: NewExptListing) {
    async function saveExptListingToFirestore(listing: NewExptListing) {
      const withImage: NewExptListing & { imageURL: string } = {
        ...listing,
        imageURL: "",
      };
      if (listing.coverImage) {
        try {
          const imageURL = await uploadImage(
            listing.coverImage,
            user?.uid!,
            "exptCoverImage"
          );
          withImage.imageURL = imageURL;
          delete withImage.coverImage;
        } catch (err: any) {
          throw new Error(
            "Error uploading cover photo. Details: " + err.message
          );
        }
      }
      const docRef = doc(EXPT_LISTINGS_COLLECTION);
      const fullListing: Omit<ExptListing, "id"> = {
        ...withImage,
        author: user?.uid!,
        timestamp: serverTimestamp(),
        remainingTokenIds: withImage.tokenIds,
      };

      try {
        await setDoc(docRef, fullListing);
        console.log("saved expt listing to firestore");
        return docRef.id;
      } catch (err: any) {
        console.log(`Error saving expt listing to firestore. Message: ` + err);
        throw new Error(
          "Error saving expt listing to firestore. Message: " + err.message
        );
      }
    }
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      await expertToken.setApprovalForAll(
        emtMarketplace.target,
        true
      );
      console.log("listing expts in contract");
      const tx = await emtMarketplace.offerExpts(
        listing.tokenIds,
        stableCoin.target,
        listing.price
      );
      await tx!.wait();
      console.log("listed expts in contract");
      const id = await saveExptListingToFirestore(listing);
      return id;
    } catch (err: any) {
      console.log(err);
      throw new Error("Error listing expts. Message: " + err.message);
    }
  }

  async function fetchExptListings(
    lastDocTimeStamp?: Timestamp,
    size = 1,
    filters?: ExptFilters
  ): Promise<ExptListingWithAuthorProfile[]> {
    // Split the tokenIds array into chunks of 30 because of firebase array-contains limit
    if (filters?.mentee) {
      const ownedExpts = await fetchOwnedExptIds(filters.mentee);
      filters.tokenIds = ownedExpts;
    }
    const tokenIdsChunks = filters?.tokenIds
      ? chunkArray(filters.tokenIds, 30)
      : [[]];

    const listingPromises = tokenIdsChunks.map(async (tokenIds) => {
      let q = query(
        EXPT_LISTINGS_COLLECTION,
        orderBy("timestamp", "desc"),
        limit(size)
      );

      if (lastDocTimeStamp) {
        q = query(q, startAfter(lastDocTimeStamp));
      }
      if (filters?.tags) {
        q = query(q, where("tags", "array-contains-any", filters.tags));
      }
      if (filters?.author) {
        q = query(q, where("owner", "==", filters.author));
      }
      if (tokenIds.length > 0) {
        q = query(q, where("tokenIds", "array-contains-any", tokenIds));
      }

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return [];

      const withAuthorPromises = querySnapshot.docs.map(async (doc) => {
        const listing = doc.data() as ExptListingWithAuthorProfile;
        listing.id = doc.id;
        console.log("listing", listing);
        listing.authorProfile = await fetchProfile(listing.author);
        return listing;
      });
      return await Promise.all(withAuthorPromises);
    });

    const listingsArrays = await Promise.all(listingPromises);

    // Flatten the array of arrays into a single array
    const listings = listingsArrays.flat();

    return listings;
  }
  async function fetchBookings(
    lastDocTimeStamp?: Timestamp,
    size = 1,
    filters?: BookingFilters
  ): Promise<Booking[]> {
    let q = query(
      BOOKINGS_COLLECTION,
      orderBy("timestamp", "desc"),
      limit(size)
    );

    if (lastDocTimeStamp) {
      q = query(q, startAfter(lastDocTimeStamp));
    }
    if (filters?.tags) {
      q = query(q, where("tags", "array-contains-any", filters.tags));
    }
    if (filters?.mentee) {
      q = query(q, where("mentee", "==", filters.mentee));
    }
    if (filters?.mentor) {
      q = query(q, where("mentor", "==", filters.mentor));
    }
    if (filters?.isPast) {
      q = query(q, where("timestamp", "<", serverTimestamp()));
    }
    if (filters?.isUpcoming) {
      q = query(q, where("timestamp", ">", serverTimestamp()));
    }

    const querySnapshot = await getDocs(q);

    const bookingPromises = querySnapshot.docs.map(async (doc) => {
      const booking = doc.data() as Booking;
      booking.id = doc.id;
      booking.exptListing = await fetchSingleListing(booking.exptListingId);
      return booking;
    });
    const bookings = await Promise.all(bookingPromises);
    return bookings;
  }

  // Helper function to split an array into chunks
  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    return Array(Math.ceil(array.length / chunkSize))
      .fill(null)
      .map((_, index) => index * chunkSize)
      .map((begin) => array.slice(begin, begin + chunkSize));
  }

  async function updateUser(updates: Omit<Partial<SignUpData>, "email">) {
    const updateResult = (await update({ updates })) as unknown as {
      updateValidationError: {
        code: string;
        validationResult: userUpdateValidationResult;
      };
    };
    if (updateResult?.updateValidationError) {
      // setUser({ ...user!, ...updates });
      return { updateValidationError: updateResult.updateValidationError };
    }
    return updates;
  }

  /**
   * Updates the user profile.
   * @param updates - The profile updates.
   * @throws Error if there is an error updating the user profile.
   */
  async function updateProfile(updates: {
    displayName?: string;
    profilePicture?: File;
    about?: string;
    username?: string;
    tags?: string;
  }) {
    const _updates: { [key: string]: string | boolean | File } = { ...updates };
    if (updates.profilePicture) {
      try {
        const imageURL = await uploadImage(
          updates.profilePicture,
          user?.uid!,
          "profilePictures"
        );
        _updates.photoURL = imageURL;
        delete _updates.profilePicture;
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    try {
      return await updateUser(_updates);
    } catch (err: any) {
      throw new Error("Error updating user profile. Details: " + err.message);
    }
  }

  async function checkFollowing(id: string) {
    try {
      const userFollowersRef = doc(
        USERS_COLLECTION,
        id,
        "followers",
        user?.uid!
      );
      const userFollowersSnap = await getDoc(userFollowersRef);
      return !!userFollowersSnap.exists();
    } catch (err: any) {
      console.log("err", err.message);
    }
    return false;
  }

  async function fetchClaimHistory(uid = user?.uid) {
    try {
      const historySnap = await getDocs(
        query(
          CLAIM_HISTORY_COLLECTION,
          where("uid", "==", uid),
          orderBy("timestamp", "desc")
        )
      );
      const history = historySnap.docs.map((doc) => {
        const data = doc.data();
        data.id = doc.id;
        return data;
      });
      return history as ClaimHistoryItem[];
    } catch (err) {
      console.log("error fetching claim history. ", err);
    }
  }

  async function buyExpt(listing: ExptListing) {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    async function updateListingInFireStore(boughtTokenId: number) {
      try {
        updateDoc(doc(EXPT_LISTINGS_COLLECTION, listing.id), {
          remainingTokenIds: arrayRemove(boughtTokenId),
          collectionSize: increment(-1),
        });
      } catch (error) {
        console.log("error Updating Token listing ", error);
      }
    }
    try {
      console.log("approving stableCoin transfer in contract");
      const tx = await stableCoin.approve(
        emtMarketplace.target,
        listing.price * 10 ** 6
      );
      const receipt = await tx.wait();
      console.log(receipt);
      console.log("buying expts in contract");
      let exptToBuyIndex = listing.remainingTokenIds.length - 1;

      //this loop is here because the chosen expt to buy
      // might have been bought already before this user completes the purchase
      while (exptToBuyIndex >= 0) {
        const tokenToBuyId = listing.remainingTokenIds[exptToBuyIndex];
        try {
          console.log("tokenToBuyId", tokenToBuyId, listing);
          const tx = await emtMarketplace.buyExpt(tokenToBuyId);
          await tx!.wait();
          console.log("bought expts in contract");
          await updateListingInFireStore(tokenToBuyId);
          return true;
        } catch (err: any) {
          if (err.message.includes("No deposit yet for token id")) {
            console.log("this expt has probably been bought. Trying the next");
            exptToBuyIndex = exptToBuyIndex - 1;
          } else throw new Error(err);
        }
      }
    } catch (err: any) {
      console.log("Error buying expts. Message: " + err.message);
      return false;
    }
  }

  async function fetchOwnedExptIds(uid = user?.uid) {
    if (!uid) return [];
    try {
      console.log("fetching tokens of user");
      const val = await expertToken.tokensOfOwner(uid);
      const tokenIds = val.map((id) => Number(id));
      console.log("tokens of owner", tokenIds);
      return tokenIds;
    } catch (err: any) {
      console.log("error fetching owned expts ids ", err);
      return [];
    }
  }

  async function fetchProfiles(
    lastdocParam?: any,
    size = 5,
    filters?: ProfileFilters
  ) {
    let q = query(USERS_COLLECTION, limit(size));
    if (lastdocParam) {
      q = query(q, startAfter(lastdocParam));
    }
    if (filters?.ment) {
      console.log("filters.ment", filters);
      q = query(q, orderBy("ment", filters.ment));
    }
    if (filters?.level) {
      q = query(
        q,
        where("ment", ">=", exptLevels![filters.level].requiredMent)
      );
    }
    if (filters?.tags) {
      q = query(q, where("tags", "array-contains-any", filters.tags));
    }
    if (filters?.numFollowers) {
      //TODO @Jovells update follow function to store count in firestore
      q = query(q, orderBy("numFollowers", filters.numFollowers));
    }
    if (filters?.usernames) {
      q = query(
        q,
        where(
          "usernameLowercase",
          "in",
          filters?.usernames.map((u) => u.toLowerCase())
        )
      );
    }
    if (filters?.uids) {
      q = query(q, where(documentId(), "in", filters.uids));
    }
    if (filters?.isFollowing) {
      //TODO @Jovells
    }
    if (filters?.isNotFollowing) {
      //TODO @Jovells
    }

    const querySnapshot = await getDocs(q);
    console.log("profilesSnapshot", querySnapshot.docs);
    const profiles = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      data.uid = doc.id;
      return data;
    });
    return profiles;
  }

  const profileReady = exptLevels !== undefined;
  async function fetchMemberVotes(id: string){
    if(!user?.uid) throw new Error("User not logged in");
    console.log("fetchingMemberVotes", id)
    try {
      const contentId = ethers.encodeBytes32String(id);
      const [upvoted, downvoted] = await emtMarketplace.memberVotes(contentId, user.uid);
      return [upvoted,  downvoted];
    } catch (err: any) {
      console.log("error fetching member votes", err);
      throw new Error(err);
    }
  }

  async function fetchPostVotes(id: string): Promise<PostVotes> {
    console.log("fetchPostVotes", id);
    try {
      const contentId = ethers.encodeBytes32String(id);
      const [_upvotes, _downvotes, diffrence] =
        await emtMarketplace.contentVotes(contentId);
      const [userUpvoted, userDownvoted] = user?.uid? await fetchMemberVotes(id) : [undefined, undefined];
      return {upvotes: Number(_upvotes), downvotes: Number(_downvotes), userUpvoted, userDownvoted};
    } catch (e: any) {
      console.log("error fetching post votes", e);
      return {upvotes: 0, downvotes: 0, userUpvoted: undefined, userDownvoted: undefined};
    }
  }

  return {
    balances,
    refetchBalances,
    isFetchingBalances,
    fetchPostVotes,
    createPost,
    fetchClaimHistory,
    fetchBookings,
    buyExpt,
    fetchExptListings,
    fetchSingleListing,
    listExpts,
    profileReady,
    updateProfile,
    fetchUnclaimedExpt,
    fetchUnclaimedMent,
    claimMent,
    claimExpt,
    fetchNotifications,
    fetchUserPosts,
    uploadImage,
    followUser,
    unfollowUser,
    fetchPosts,
    fetchProfile,
    checkFollowing,
    voteOnPost,
    fetchSinglePost,
    fetchProfiles,
  };
}
