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
  PolicyDoc,
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
  DocumentReference,
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
  ADMIN_COLLECTION,
  exptLevelKeys,
  chain,
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

function loadingToast(
  message: string,
  stage?: number | undefined,
  error?: boolean
) {
  const t = toast({
    title: message,
    variant: "default",
    description:
      stage !== undefined ? (
        <div>
          <Progress
            value={stage}
            className="h-2 mt-2 w-full text-accent-4 bg-accent-shade"
          />
        </div>
      ) : undefined,
    duration: stage !== undefined && stage !== 100 && !error ? Infinity : 3100,
  });
  return (newMessage: string, stage?: number | undefined, error?: boolean) =>
    t.update({
      id: t.id,
      title: newMessage || message,
      description:
        stage !== undefined ? (
          <div>
            <Progress
              value={stage}
              className="h-2 mt-2 w-full text-accent-4 bg-accent-shade"
            />
          </div>
        ) : undefined,
      variant: error ? "destructive" : stage === 100 ? "success" : "default",
      duration:
        stage !== undefined && stage !== 100 && !error ? Infinity : 3000,
    });
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
  const {
    emtMarketplace,
    mentorToken,
    expertToken,
    network,
    stableCoin,
    provider,
  } = useContracts();
  const { user } = useUser();
  const { update } = useSession();
  const [signer, setSigner] = useState<ethers.Signer>();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const wrongChain = network?.chain?.id !== chain.id;

  //queries
  /**
   * UseQuery hook for fetching backend data and managing balances.
   *
   * @returns An object containing the fetched data and balance-related functions.
   */
  const { data: exptLevels } = useQuery({
    queryKey: ["exptlevels"],
    queryFn: async () => {
      const levelsPromises = exptLevelKeys.map(async (key) => {
        const l = await emtMarketplace.exptLevels(key);
        return { requiredMent: Number(l[0]), receivableExpt: Number(l[1]) };
      });
      const levels = await Promise.all(levelsPromises);
      console.log("exptLevels", levels);
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
          const balance = Number(await contract.balanceOf(currentUserId));
          return {
            [token.name]:
              token.name === "USDT"
                ? parseFloat(ethers.formatUnits(balance, 6)).toFixed(2)
                : balance,
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
    function getTokenIdsClaimed(receipt: ContractTransactionReceipt) {
      const fragment = expertToken.filters.Transfer().fragment;
      // console.log(receipt?.logs)
      const tokenIds: number[] = [];
      receipt?.logs.forEach((log, i) => {
        try {
          const d = emtMarketplace.interface.decodeEventLog(
            fragment,
            log.data,
            log.topics
          );
          // console.log("log" + i, d);
          // mentClaimed = Number(d[2]);
          tokenIds.push(Number(d[2]));
        } catch (e) {
          console.log("log" + i, log, e);
        }
      });
      console.log("tokenIds", tokenIds);
      return tokenIds;
    }

    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const tx = await emtMarketplace.claimMent();
      const receipt = await tx!.wait();
      console.log("claimed ment");
      const tokenIds = getTokenIdsClaimed(receipt!);
      const historyItem: Omit<ClaimHistoryItem, "id" | "timestamp"> = {
        type: "ment",
        amount: tokenIds.length,
        tokenIds,
        uid: user.uid,
      };
      const claimHistoryItem =
        await saveClaimHistoryItemToFirestore(historyItem);
      const newMent = await updateUserMentInFirestore();
      return {
        mentClaimed: tokenIds.length,
        tokenIds,
        newMent,
        claimHistoryItem,
      };
    } catch (err: any) {
      console.log(err);
      throw new Error("Error claiming ment. Message: " + err.message);
    }
  }

  async function fetchMentAndLevel(uid = user?.uid): Promise<[number, number]> {
    console.log("fetchMentAndLevel", uid);
    let ment = balances.MENT;
    if (uid !== user?.uid) {
      ment = await fetchMent(uid);
    }
    console.log("ment2222: ", ment);
    let userlevel = 0;
    exptLevels
      ? exptLevels.some((level, index) => {
          if ((ment || 0) >= level.requiredMent) {
            userlevel = index + 1;
            return false;
          } else return true;
        })
      : 0;
    console.log("level: ", userlevel);
    return [Number(ment), Number(userlevel)];
  }

  async function claimExpt() {
    function extractExptClaimedFromTxReceipt(
      receipt: ContractTransactionReceipt
    ) {
      const filter = emtMarketplace.filters.ExptClaimed().fragment;
      let exptClaimed = 0;
      // console.log(receipt?.logs)
      receipt?.logs.some((log) => {
        try {
          const d = emtMarketplace.interface.decodeEventLog(filter, log.data);
          console.log("l", d);
          exptClaimed = Number(d[1]);
          return true;
        } catch (err) {
          return false;
        }
      });
      console.log("exptClaimed", exptClaimed);
      return exptClaimed;
    }
    if (!user?.uid) {
      toast({
        title: "Login",
        description: "Please login to claim expt",
      });
      throw new Error("User not logged in");
    }
    for (const i of exptLevelKeys) {
      const level = i + 1;
      const t = loadingToast("Claiming expt", 1);
      try {
        const tx = await emtMarketplace.claimExpt(level);
        t("mining transaction", 50);
        const receipt = await tx!.wait();
        const exptClaimed = extractExptClaimedFromTxReceipt(receipt!);
        const historyItem: Omit<ClaimHistoryItem, "id" | "timestamp"> = {
          type: "expt",
          amount: exptClaimed,
          level: Number(level),
          uid: user.uid,
        };
        t("almost there", 80);
        const val = await expertToken.balanceOf(user.uid);
        const newExptBalance = Number(val);
        const claimHistoryItem =
          await saveClaimHistoryItemToFirestore(historyItem);
        console.log("claimed expt");
        t(exptClaimed + " Expts claimed for level " + level, 100);
        return { newExptBalance, claimHistoryItem };
      } catch (err: any) {
        if (
          err.message.includes("Not qualified for level") ||
          err.message.includes("Level has already been claimed") ||
          err.message.includes("Expt Level does not exists")
        ) {
          continue;
        } else {
          console.log(err);
          t("Error claiming expt at level " + level, 0, true);
          throw new Error("Error claiming expt. Message: " + err.message);
        }
      }
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
    console.log("usebackend author: ", userDoc.data());
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
  /**
   * Fetches a single listing from the database.
   *
   * @param id - The ID of the listing to fetch.
   * @returns A promise that resolves to the fetched listing.
   * @throws An error if the listing does not exist.
   */
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

  /**
   * Fetches the number of followers for a user.
   *
   * @param id - The ID of the user.
   * @returns The number of followers.
   */
  async function fetchNumFollowers(id: string) {
    try {
      const userFollowersRef = collection(USERS_COLLECTION, id, "followers");
      const querySnapshot = await getCountFromServer(query(userFollowersRef));
      const count = querySnapshot.data().count;
      console.log("fetchNumFollowers", count);
      return count;
    } catch (err) {
      console.log("Error fetching num followers", err);
      throw new Error('Error fetching num followers'+ err);
    }
  }

  /**
   * Fetches the number of followers for a given user ID.
   *
   * @param id - The ID of the user.
   * @returns The number of followers.
   */
  async function fetchNumFollowing(id: string) {
    try {
      const q = query(
        collectionGroup(firestore, "followers"),
        where("uid", "==", id)
      );
      const querySnapshot = await getCountFromServer(q);
      const count = querySnapshot.data().count;
      console.log("fetchNumFollowing", count);
      return count;
    } catch (err) {
      console.log("Error fetching num following", err);
      throw new Error('Error fetching num following'+ err);
    }
  }

  /**
   * Fetches a user document from the database.
   * @param id - The ID of the user document to fetch.
   * @returns The fetched user document.
   */
  async function fetchUserDoc(id: string) {
    console.log("fetching user doc", id);
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data() as UserProfile;
    data && (data.uid = id);
    console.log("fetched user doc");
    return data;
  }

  /**
   * Fetches the ment value for a given address.
   * @param address The address to fetch the ment value for.
   * @returns The ment value for the given address.
   */
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
  /**
   * Fetches the number of unclaimed ment for the logged-in user.
   *
   * @returns The number of unclaimed ment.
   * @throws If the user is not logged in.
   */
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

  /**
   * Fetches the unclaimed experience points (expt) for the logged-in user.
   *
   * @returns The number of unclaimed experience points.
   * @throws {Error} If the user is not logged in or if there is an error fetching the experience points.
   */
  async function fetchUnclaimedExpt() {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      console.log("fetching unclaimed expt");
      let unclaimedExpt = 0;
      for (let i = 0; i < exptLevelKeys.length; i++) {
        try {
          const val = await emtMarketplace.unclaimedExpt(user.uid, i + 1);
          unclaimedExpt += Number(val);
        } catch (err) {
          console.log(
            "Error fetching unclaimed expt for level " + (i + 1) + err
          );
        }
      }
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

  /**
   * Fetches the profile of a user.
   *
   * @param uid - The user ID.
   * @param exclude - An optional object specifying which parts of the profile to exclude.
   *                  - followers: Set to true to exclude the number of followers.
   *                  - following: Set to true to exclude the number of following.
   *                  - ownedExptIds: Set to true to exclude the owned expt IDs.
   * @returns A promise that resolves to the user's profile.
   * @throws If there is an error fetching the profile.
   */

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
   * Retrieves the IDs of the users that a user is following.
   * @param uid - The user ID. If not provided, the current user's ID will be used.
   * @returns A promise that resolves to an array of followings IDs.
   */
  async function getUserFollowingsIds(uid = user?.uid, size = 10) {
    try {
      const q = query(
        collectionGroup(firestore, "followers"),
        where("uid", "==", uid),
        limit(size)
      );
      console.log("isfollowing");
      const snap = await getDocs(q);
      console.log(snap);
      const uids = snap.docs.map((d) => d.ref.path.split("/")[1]);
      return uids;
    } catch (e) {
      console.log("error fetching uids of followings", e);
      return [];
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
    size = 5,
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
      const uidsOfFollowings = await getUserFollowingsIds();
      console.log("pppp, fetching posts following", uidsOfFollowings);
      q = query(q, where("owner", "in", uidsOfFollowings));
    }

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
   * Fetches privacy policy from the database.
   * @param
   * @returns An the latest privacy policy & timestamp.
   */
  async function fetchPrivacyPolicy(): Promise<PolicyDoc> {
    console.log("calling fetch...");

    const policyDocRef = doc(ADMIN_COLLECTION, "privacy-policy");
    const policyDoc = await getDoc(policyDocRef);
    if (policyDoc.exists()) {
      const data = policyDoc.data() as PolicyDoc;
      return data;
    } else {
      throw new Error("Policy document not found!");
    }
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
    if (!user?.uid) {
      toast({
        title: "Login",
        description: "Please login to create a post",
      });
      throw new Error("User not logged in");
    }
    const t = loadingToast("Creating Post", 1);
    try {
      const docRef = await writePostToBlockchain();
      t("Almost there...", 50);
      const imageURL = await uploadPostImage(docRef.id);
      t("", 80);
      await savePostToFirestore(imageURL, docRef);
      console.log("Document written with ID: ", docRef.id);
      t("Post Created successfully", 100);
      return { id: docRef.id, imageURL };
    } catch (err: any) {
      console.log(err);
      t("Error creating post", 0, true);
      throw new Error(err);
    }
    async function uploadPostImage(id: string) {
      if (!post.image) return "";
      try {
        console.log("uploading image");
        const imageURL = await uploadImage(post.image, id, "contentImages");
        return imageURL;
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    async function writePostToBlockchain() {
      const docRef = doc(CONTENTS_COLLECTION);
      const contentId = ethers.encodeBytes32String(docRef.id);
      console.log("writing to blockchain", post, "pstId", contentId);
      try {
        console.log("emtMarketplace", emtMarketplace);
        const tx = await emtMarketplace.addContent(contentId);
        t("Mining transaction", 30);
        const receipt = await tx.wait();

        console.log("Content added to blockchain. Receipt:", receipt);
        return docRef;
      } catch (err: any) {
        console.log("Error writing to blockchain. Details: " + err.message);
        throw new Error("Error writing to blockchain. Details: " + err.message);
      }
    }

    async function savePostToFirestore(
      imageURL: string,
      docRef: DocumentReference
    ) {
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
      } catch (err: any) {
        throw new Error("Error writing to database. Details: " + err.message);
      }
    }
  }

  /**
   * Submits a user support request.
   * @param request - The request data.
   * @returns A success string or void.
   * @throws Error if there is an error writing to the database.
   */
  async function submitRequest(request: {
    email: string;
    description: string;
  }) {
    if (!user?.uid) {
      toast({
        title: "Login",
        description: "Please login to submit a request",
      });
      throw new Error("User not logged in");
    }
    const t = loadingToast("Submitting your request", 1);
    try {
      // TODO @od41 error: missing permissions
      const docRef = doc(ADMIN_COLLECTION);
      await saveRequestToFirestore(docRef);
      console.log("Document written with ID: ", docRef.id);
      t("Request submitted successfully", 100);
      return "successfull";
    } catch (err: any) {
      console.log(err);
      t("Error submitting request", 0, true);
      throw new Error(err);
    }

    async function saveRequestToFirestore(docRef: DocumentReference) {
      try {
        console.log("writing to database");
        await setDoc(docRef, {
          email: request.email,
          description: request.description,
          timestamp: serverTimestamp(),
        });
      } catch (err: any) {
        throw new Error("Error writing to database. Details: " + err.message);
      }
    }
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
      console.log(
        "voting in contract. firebases Id:",
        id,
        "contentId:",
        contentId
      );
      if (isUpvote) {
        tx = await emtMarketplace.upVoteContent(contentId);
      } else if (voteType === "downvote") {
        tx = await emtMarketplace.downVoteContent(contentId);
      }
      t("Mining transaction", 30);
      await tx!.wait();
      t("Almost done", 70);
      const [_upvotes, _downvotes] =
        await emtMarketplace.contentVotes(contentId);
      console.log("voted. New votes: ", {
        upvotes: _upvotes,
        downvotes: _downvotes,
      });

      createNotification({
        type: voteType,
        contentId: id,
        recipients: [owner],
      });
      t("Vote SuccessFul", 100);
      return {
        upvotes: Number(_upvotes),
        downvotes: Number(_downvotes),
        userDownvoted: !isUpvote,
        userUpvoted: isUpvote,
      };
    } catch (err: any) {
      console.log(err);
      if (err.message.includes("Member has already up voted")) {
        t("You have already upvoted this post", undefined, true);
      } else if (err.message.includes("Member has already down voted")) {
        t("You have already downvoted this post", undefined, true);
      } else if (err.message.includes("Cannot Vote Again Due to Claim Rules")) {
        t("You cannot change your vote", undefined, true);
      } else t("Error Voting on Post", undefined, true);
      throw new Error("Error voting on content. Message: " + err.message);
    }
  }

  /**
   * Follows a user by adding the current user's ID to the followers list of the specified user.
   *
   * @param id - The ID of the user to follow.
   * @returns A boolean indicating whether the user was successfully followed.
   * @throws An error if the user is not logged in or if there is an error following the user.
   */
  async function followUser(id: string): Promise<boolean> {
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

      await setDoc(userFollowersRef, {
        timestamp: serverTimestamp(),
        uid: user.uid,
      });

      createNotification({ type: "follow", recipients: [id] });

      return true;
    } catch (err: any) {
      throw new Error("Error following user. Message: " + err.message);
    }
  }

  /**
   * Unfollows a user by removing the current user's ID from the followers list of the specified user.
   *
   * @param id - The ID of the user to unfollow.
   * @returns A boolean indicating whether the user was successfully unfollowed.
   * @throws An error if there is an error unfollowing the user.
   */
  async function unfollowUser(id: string): Promise<boolean> {
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

  /**
   * Lists the expts and performs necessary operations such as uploading cover photo,
   * saving to Firestore, and listing in the contract.
   * @param listing - The new expt listing to be created.
   * @returns The ID of the saved expt listing.
   * @throws Error if there is an error uploading the cover photo, saving to Firestore,
   * listing in the contract, or if the user is not logged in.
   */
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
      toast({
        title: "Login",
        description: "Please login to list expts",
      });
      throw new Error("User not logged in");
    }
    const t = loadingToast("Listing Expts", 1);
    try {
      t("seeking approval to transfer expts", 10);
      const approvalTxn = await expertToken.setApprovalForAll(emtMarketplace.target, true);
      t("mining transaction", 20);
      await approvalTxn!.wait();
      t("listing expts in contract", 40);
      const tx = await emtMarketplace.offerExpts(
        listing.tokenIds,
        stableCoin.target,
        listing.price
      );
      t("mining transaction", 50);
      await tx!.wait();
      console.log("listed expts in contract");
      t("Finalising Listing", 70);
      const id = await saveExptListingToFirestore(listing);
      t("Expts listed successfully", 100);
      return id;
    } catch (err: any) {
      console.log(err);
      t("Error listing expts", 0, true);
      throw new Error("Error listing expts. Message: " + err.message);
    }
  }

  /**
   * Fetches the list of expt listings populated with author profile based on the provided filters.
   * @param lastDocTimeStamp - The timestamp of the last document.
   * @param size - The number of listings to fetch.
   * @param filters - The filters to apply.
   * @returns A promise that resolves to an array of expt listings with author profile.
   */
  async function fetchExptListings(
    lastDoc?: ExptListingWithAuthorProfile,
    size = 1,
    filters?: ExptFilters
  ): Promise<ExptListingWithAuthorProfile[]> {
    //fetch expts that the user bought from another
    try {

      if (filters?.mentee) {
        const ownedExpts = await fetchOwnedExptIds(filters.mentee);
        filters.tokenIds = ownedExpts;
      }
      // fetch expts that the user listed
      if (filters?.mentor) {
        const ownedExpts = await fetchOwnedExptIds(filters.mentor);
        filters.tokenIds = ownedExpts;
      }
      // Split the tokenIds array into chunks of 30 because of firebase array-contains limit
      const tokenIdsChunks = filters?.tokenIds
        ? chunkArray(filters.tokenIds, 30)
        : [[]];
  
      const listingPromises = tokenIdsChunks.map(async (tokenIds) => {
        // when fetching the listings for the mentee we use an  inequality operator in the author field
        // which requires us to order by the author field and start after the last doc's author
        // this is because firebase does not allow inequality operators on multiple fields
        // https://firebase.google.com/docs/firestore/query-data/order-limit-data#limitations
        // so we check if the mentee filter is NOT present and if so we order by and starty after the timestamp
        let q = query(
          EXPT_LISTINGS_COLLECTION,
          limit(size)
        );
        if (!(filters?.mentee) ) {
          q = query(q, orderBy("timestamp", "desc"), startAfter(lastDoc?.timestamp || ''));
        }
        if (filters?.mentee) {
          q = query(q, orderBy("author"), where("author", "!=", filters.mentee), startAfter(lastDoc?.author || ''));
        }
        // fetch expts that the user listed
        if (filters?.mentor) {
          q = query(q, where("author", "==", filters.mentor));
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
        console.log('query', )
  
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];
  
        const withAuthorPromises = querySnapshot.docs.map(async (doc) => {
          const listing = doc.data() as ExptListingWithAuthorProfile;
          listing.id = doc.id;
          listing.authorProfile = await fetchProfile(listing.author);
          listing.tokensOfCurrentUser = listing.tokenIds.filter(
            (tokenId) => filters?.tokenIds?.includes(tokenId)
          );
          return listing;
        });
        return await Promise.all(withAuthorPromises);
      });
  
      const listingsArrays = await Promise.all(listingPromises);
  
      // Flatten the array of arrays into a single array
      const listings = listingsArrays.flat();
      return listings;
    } catch (err: any) {
      console.log("Error fetching expt listings. Details: " + err);
      throw new Error(err);
    }

  }

  async function fetchExpts(
    lastDoc?: { id: string; listing: ExptListingWithAuthorProfile },
    size = 1,
    filters?: ExptFilters
  ) {
    try {
      const listings = await fetchExptListings(lastDoc?.listing, size, filters);
      const exptsPromises = listings.map((listing) => listing.tokensOfCurrentUser!.map( async (tokenId) => {
        const remainingSessions = await getRemainingSessions(listing, tokenId);
          return {
            id: tokenId,
            listing,
            remainingSessions,
          }
        }
      )
      ).flat()
    return await Promise.all(exptsPromises);
    } catch (err: any) {
      console.log("Error fetching expts. Details: " + err);
      throw new Error(err);
    }

  async function getRemainingSessions(listing: ExptListingWithAuthorProfile, tokenId: number) {
    const q = query(BOOKINGS_COLLECTION, where('exptTokenId', '==', tokenId))
    const bookings = (await getDocs(q)).docs.map(d=> d.data()) as Booking[];
    const bookedSessions = bookings.reduce((acc, booking) => {
      return acc + booking.sessionCount;
    }, 0)

    return listing.sessionCount - bookedSessions;
  }
}


  /**
   * Fetches the list of bookings based on the provided filters.
   * @param lastDocTimeStamp - The timestamp of the last document.
   * @param size - The number of bookings to fetch.
   * @param filters - The filters to apply.
   * @returns A promise that resolves to an array of bookings.
   */
  async function fetchBookings(
    lastDoc? : Booking,
    size = 1,
    filters?: BookingFilters
  ): Promise<Booking[]> {
    let q = query(
      BOOKINGS_COLLECTION,
      orderBy("timestamp", "desc"),
      limit(size)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc.timestamp));
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

  async function bookExpert(
    data: Omit<
      Booking,
      "id" | "timestamp" | "mentee" | "isCompleted" | "exptListing"
    >
  ) {
    if (!user?.uid) {
      toast({
        title: "Login",
        description: "Please login to book an expert",
      });
      throw new Error("User not logged in");
    }
    const t = loadingToast("Booking Expert", 1);
    try {
      const docRef = doc(BOOKINGS_COLLECTION);
      const booking: Omit<Booking, "id"> = {
        ...data,
        isCompleted: false,
        mentee: user?.uid!,
        timestamp: serverTimestamp(),
      };

      await setDoc(docRef, booking);
      console.log("saved booking to firestore");
      t("Expert Booked successfully", 100);
      return { ...booking, id: docRef.id } satisfies Booking;
    } catch (err: any) {
      console.log(err);
      t("Error booking expert", 0, true);
      throw new Error("Error booking expert. Message: " + err.message);
    }
  }

  // Helper function to split an array into chunks
  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    return Array(Math.ceil(array.length / chunkSize))
      .fill(null)
      .map((_, index) => index * chunkSize)
      .map((begin) => array.slice(begin, begin + chunkSize));
  }

  /**
   * Updates the user profile with the provided updates.
   * Also validates the updates before updating the user.
   * @param updates - The profile updates.
   * @throws Error if there is an error updating the user profile.
   * @returns A promise that resolves to the updated profile.
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
      return await sendUserProfileUpdates(_updates);
    } catch (err: any) {
      throw new Error("Error updating user profile. Details: " + err.message);
    }
    /**
     * Sends the provided updates to the database.
     * Validation is done here
     * @param updates - The updates to apply to the user.
     * @returns A promise that resolves to the updated user.
     * @returns A promise that resolves to an object containing the validation error if there is a validation error.
     */
    async function sendUserProfileUpdates(
      updates: Omit<Partial<SignUpData>, "email">
    ) {
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
  }

  /**
   * Checks if the current user is following the specified user.
   * @param id - The ID of the user to check.
   * @returns A promise that resolves to a boolean indicating if the current user is following the specified user.
   */
  async function checkFollowing(id: string) {
    try {
      const userFollowersRef = doc(
        USERS_COLLECTION,
        id,
        "followers",
        user?.uid!
      );
      const userFollowersSnap = await getDoc(userFollowersRef);
      return !!userFollowersSnap.data()?.uid;
    } catch (err: any) {
      console.log("error checking following", err.message, id, user);
    }
    return false;
  }

  /**
   * Fetches the claim history of the specified user.
   * @param uid - The ID of the user. Defaults to the current user's ID.
   * @returns A promise that resolves to an array of claim history items.
   */
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

  /**
   * Buys an expt listing.
   * @param listing - The expt listing to buy.
   * @returns A promise that resolves to a boolean indicating if the purchase was successful.
   * @throws Error if the user is not logged in or there is an error buying the expt.
   */
  async function buyExpt(listing: ExptListing) {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    const t = loadingToast("Buying Expts", 1);
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
      t("seeking approval to transfer stablecoin", 10);
      console.log("approving stableCoin transfer in contract");
      const tx = await stableCoin.approve(
        emtMarketplace.target,
        listing.price * 10 ** 6
      );
      t("mining transaction", 20);
      const receipt = await tx.wait();
      console.log(receipt);
      console.log("buying expts in contract");
      t("buying expts in contract", 40);
      let exptToBuyIndex = listing.remainingTokenIds.length - 1;

      //this loop is here because the chosen expt to buy
      // might have been bought already before this user completes the purchase
      while (exptToBuyIndex >= 0) {
        const tokenToBuyId = listing.remainingTokenIds[exptToBuyIndex];
        let loadingPercent = 40 + ((listing.remainingTokenIds.length - exptToBuyIndex) / listing.remainingTokenIds.length) * 30;
        try {
          console.log("tokenToBuyId", tokenToBuyId, listing);
          const tx = await emtMarketplace.buyExpt(tokenToBuyId);
          await tx!.wait();
          console.log("bought expt in contract");
          t("Finalising Purchase", 80);
          await updateListingInFireStore(tokenToBuyId);
          t("Expt bought successfully", 100);
          return true;
        } catch (err: any) {
          if (err.message.includes("No deposit yet for token id")) {
            console.log("this expt has probably been bought. Trying the next");
            exptToBuyIndex = exptToBuyIndex - 1;
            t("buying expts in contract", loadingPercent);
          } else {
            t("Error buying expts", 0, true);
            throw new Error(err);}
        }
        t("this listing has been sold out", undefined, true);
      }

    } catch (err: any) {
      console.log("Error buying expts. Message: " + err.message);
      return false;
    }
  }

  /**
   * Fetches the IDs of the expts owned by the specified user.
   * @param uid - The ID of the user. Defaults to the current user's ID.
   * @returns A promise that resolves to an array of expt IDs.
   */
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

  async function fetchOwnedExptIdsOfMentee(uid = user?.uid) {
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

  async function fetchMentorExptIds(uid = user?.uid) {
    if (!uid) return [];
    console.log("fetching mentor expts ids");
    try {
      const q = query(
        CLAIM_HISTORY_COLLECTION,
        where("uid", "==", uid),
        where("type", "==", "expt")
      );
      const querySnapshot = await getDocs(q);
      const tokenIds = querySnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (data.tokenId) acc.push(...data.tokenIds);
        return acc;
      }, [] as number[]);
      return tokenIds;
    } catch (err: any) {
      console.log("error fetching mentor expts ids ", err);
      return [];
    }
  }

  async function fetchMenteeExptIds(uid = user?.uid) {
    if (!uid) return [];
    console.log("fetching mentee expts ids");
    try {
      const q = query(
        EXPT_LISTINGS_COLLECTION,
        where(`buyers.${uid}`, ">", "")
      );
    } catch (err: any) {
      console.log("error fetching mentee expts ids ", err);
      return [];
    }
  }

  /**
   * Fetches the profiles based on the provided filters.
   * @param lastdocParam - The last document parameter.
   * @param size - The number of profiles to fetch.
   * @param filters - The filters to apply.
   * @returns A promise that resolves to an array of profiles.
   */
  async function fetchProfiles(
    lastdoc?: UserProfile,
    size = 5,
    filters?: ProfileFilters
  ) {
    let q = query(USERS_COLLECTION, limit(size));

    if (filters?.ment) {
      console.log("filters.ment", filters);
      q = query(
        q,
        orderBy("ment", filters.ment),
        startAfter(lastdoc?.ment || "")
      );
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
      q = query(
        q,
        orderBy("numFollowers", filters.numFollowers),
        startAfter(lastdoc?.numFollowers || "")
      );
    }
    if (filters?.usernames) {
      q = query(
        q,
        orderBy("username"),
        startAfter(lastdoc?.username || ""),
        where(
          "usernameLowercase",
          "in",
          filters?.usernames.map((u) => u.toLowerCase())
        )
      );
    }
    if (filters?.isFollowing) {
      console.log("fetching profiles following");
      const uidsOfFollowings = await getUserFollowingsIds();
      filters.uids = filters.uids
        ? filters.uids.filter((value) => uidsOfFollowings.includes(value))
        : uidsOfFollowings;
    }
    if (filters?.uids) {
      q = query(
        q,
        where(documentId(), "in", filters.uids),
        orderBy(documentId()),
        startAfter(lastdoc?.uid || "")
      );
    }
    if (filters?.isNotFollowing) {
      q = query(q, orderBy(documentId()), startAfter(lastdoc?.uid || " "));
      console.trace("1. fetching profiles not following", size);

      const profiles = await doFetch();
      const profilesNotFollowing: UserProfile[] = [];
      if (profiles.length === 0) return [];
      for (let profile of profiles) {
        const isFollowing = await checkFollowing(profile.uid);
        if (profile.uid !== user?.uid && !isFollowing) {
          profilesNotFollowing.push(profile);
        }
      }
      if (profilesNotFollowing.length < size) {
        const moreProfiles = await fetchProfiles(
          profiles[profiles.length - 1],
          size - profilesNotFollowing.length,
          filters
        );
        profilesNotFollowing.push(...moreProfiles);
      }
      return profilesNotFollowing;
    }

    const profiles = await doFetch();
    return profiles;

    async function doFetch() {
      const querySnapshot = await getDocs(q);
      const profiles = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        data.uid = doc.id;
        return data as UserProfile;
      });
      return profiles;
    }
  }

  /**
   * Fetches the member votes for the specified content.
   * @param id - The ID of the content.
   * @returns A promise that resolves to an array of member votes.
   * @throws Error if the user is not logged in or there is an error fetching the member votes.
   */
  async function fetchMemberVotes(id: string) {
    if (!user?.uid) throw new Error("User not logged in");
    console.log("fetchingMemberVotes", id);
    try {
      const contentId = ethers.encodeBytes32String(id);
      const [upvoted, downvoted] = await emtMarketplace.memberVotes(
        contentId,
        user.uid
      );
      return [upvoted, downvoted];
    } catch (err: any) {
      console.log("error fetching member votes", err);
      throw new Error(err);
    }
  }

  /**
   * Fetches the votes for the specified post.
   * @param id - The ID of the post.
   * @returns A promise that resolves to the post votes.
   */
  async function fetchPostVotes(id: string): Promise<PostVotes> {
    console.log("fetchPostVotes", id);
    try {
      const contentId = ethers.encodeBytes32String(id);
      const [_upvotes, _downvotes, diffrence] =
        await emtMarketplace.contentVotes(contentId);
      const [userUpvoted, userDownvoted] = user?.uid
        ? await fetchMemberVotes(id)
        : [undefined, undefined];
      return {
        upvotes: Number(_upvotes),
        downvotes: Number(_downvotes),
        userUpvoted,
        userDownvoted,
      };
    } catch (e: any) {
      console.log("error fetching post votes", e);
      return {
        upvotes: 0,
        downvotes: 0,
        userUpvoted: undefined,
        userDownvoted: undefined,
      };
    }
  }

  const profileReady = exptLevels !== undefined;

  return {
    balances,
    refetchBalances,
    isFetchingBalances,
    fetchPostVotes,
    createPost,
    submitRequest,
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
    fetchPrivacyPolicy,
    bookExpert,
    fetchExpts,
  };
}
