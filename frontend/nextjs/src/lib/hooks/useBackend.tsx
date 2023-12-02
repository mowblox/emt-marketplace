"use client";
import { useContracts } from "./contracts";
import { useUser } from "./user";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  getDoc,
  endBefore,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { storage } from "../firebase";
import { toast } from "@/components/ui/use-toast";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { ContractTransactionResponse, ethers } from "ethers6";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BuiltNotification, Content, NotificationData, NotificationFilters, PostFilters, User, UserProfile } from "@/lib/types";
import { POST_PAGE, PROFILE_PAGE } from "@/app/(with wallet)/_components/page-links";
import { formatDistance } from 'date-fns';
import { CONTENTS_COLLECTION, NOTIFICATIONS_COLLECTION, USERS_COLLECTION } from "../../../emt.config";


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
  const { EMTMarketPlace, provider } = useContracts();
  const { user, updateUser } = useUser();
  const [EMTMarketPlaceWithSigner, setEmtMarketPlaceWithSigner] = useState(EMTMarketPlace);
  
  async function createNotification(data: Partial<NotificationData>){
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

  async function fetchVotesAndUsernames(notifications : BuiltNotification[]) {
    console.log('fetchVotesAndUsernames', notifications)
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
  
        const [upvotes, downvotes, netVotes] = await EMTMarketPlace.contentVotes(ethers.encodeBytes32String(notification.contentId!));
        notification.votes = Number(notification.type === "upvote" ? upvotes : downvotes);
      }
      return notification;
    });
  
    const finalNotifications = await Promise.all(fetchPromises);
    return finalNotifications;

    
  }


  async function buildNotifications(notifications: QueryDocumentSnapshot[], oldNotifications?: BuiltNotification[]){
    console.log('buildNotifications', notifications)
    const newNofications=notifications.reduce((acc, doc) => {
      const notification = doc.data() as BuiltNotification ;
      let  notifToBuildIndex =  acc.findIndex(notif=> notif.type === notification.type && notif.contentId === notification.contentId)
      
      
      let notifToBuild = notifToBuildIndex> -1  ? {...acc[notifToBuildIndex]} : notification
      console.log('notitob:', notifToBuild)
      if (notifToBuildIndex > -1 ){
        notifToBuild.others ++;
        notifToBuild.datePublished = formatDistance(notifToBuild.timestamp.toDate(), new Date(), { addSuffix: false }) 
        notifToBuild.ids.push(doc.id)
      }
      else {
        notifToBuild = notification;
        notifToBuild.others = 0;
        notifToBuild.ids = [doc.id];
        notifToBuild.href = notification.contentId? POST_PAGE(notification.contentId) : PROFILE_PAGE(notification.sender)
      }
      
      if(notifToBuild.type === "follow"){
        notifToBuild.summary = ` ${notifToBuild.others ? "and " + notifToBuild.others + " others" : ""} started following you`;
      }
      if(notifToBuild.type === "upvote" || notifToBuild.type === "downvote"){
        notifToBuild.summary = ` ${notifToBuild.others ? "and " + notifToBuild.others + " others" : ""}  ${notifToBuild.type}d your post`;
      }
      notifToBuild.isNew = true;
      acc[notifToBuildIndex > -1 ? notifToBuildIndex : acc.length] = notifToBuild;
      return acc;
    }, oldNotifications || [] )

    return await fetchVotesAndUsernames(newNofications);
  }
  
  async function fetchNotifications(lastDocTimeStamp?: Timestamp, size = 1, oldNotifications?: BuiltNotification[]): Promise<BuiltNotification[]> {
    if(user?.uid === undefined) return [];
    // fetch notifications from firestore
      let q = query(NOTIFICATIONS_COLLECTION, orderBy("timestamp", "desc"), where("recipients","array-contains-any", [user?.uid, "all"]), limit(size));
      if(lastDocTimeStamp){
        q = query(q, startAfter(lastDocTimeStamp))
      }
      const querySnapshot = await getDocs(q);

      const notifications = await buildNotifications(querySnapshot.docs, oldNotifications)

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
    const contentId = ethers.encodeBytes32String(id);
    let _upvotes  , _downvotes ;
    try{
       [_upvotes, _downvotes] = await EMTMarketPlace.contentVotes(contentId);
    }catch(e){
      [_upvotes, _downvotes] = [0, 0];
      console.log("error fetching post votes", e)
    }
    return { author, metadata: { upvotes: Number(_upvotes), downvotes: Number(_downvotes), id } };
  }
  
  async function fetchSinglePost(id: string) {
    const docRef = doc(CONTENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const post = docSnap.data() as Content["post"];
      const { author, metadata } = await fetchPostMetadata(post.owner, docSnap.id);
      return { post, author, metadata };
    } else {
      throw new Error("No such document!");
    }
  }

  async function fetchProfile(id: string) {
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    const profile : UserProfile = userDoc.data() as UserProfile;
    return profile;
  }

  /**
   * Fetches posts from the database.
   * @param lastDocTimeStamp - The timestamp of the last document.
   * @param size - The number of posts to fetch.
   * @returns An array of fetched posts.
   */
  async function fetchPosts(lastDocTimeStamp?: Timestamp, size = 1, filters?: PostFilters): Promise<Content[]> {
    let q = query(CONTENTS_COLLECTION, orderBy("timestamp", "desc"), limit(size))

    if(lastDocTimeStamp){
      q = query(q, startAfter(lastDocTimeStamp))
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

    
    const querySnapshot = await getDocs(q);

    const promises= querySnapshot.docs.map(async (doc) => {
      const post = doc.data() as Content["post"];
      const { author, metadata } = await fetchPostMetadata(post.owner, doc.id);
      return { post, author, metadata };
    })
    const posts : Content[] = await Promise.all(promises);
    return posts;
  }

  useEffect(() => {
    async function setSigner() {
      const signer = await provider.getSigner();
      setEmtMarketPlaceWithSigner(EMTMarketPlace.connect(signer));
    }
    if (user && provider) {
      setSigner();
    }
  }, [user, provider, EMTMarketPlace]);

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
  }) {
    const docRef = doc(CONTENTS_COLLECTION);
    const id = ethers.encodeBytes32String(docRef.id);
    try {
      const tx = await EMTMarketPlaceWithSigner.addContent(id);
      await tx.wait();
      console.log("Content added to blockchain");
    } catch (err: any) {
      console.log("Error writing to blockchain. Details: " + err.message);
      throw new Error("Error writing to blockchain. Details: " + err.message);
    }
    let imageURL = "";

    if (post.image) {
      try {
        imageURL = await uploadImage(post.image, docRef.id, "contentImages");
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    try {
      await setDoc(docRef, {
        title: post.title,
        body: post.body,
        owner: user?.uid,
        imageURL: imageURL,
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
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
    const querySnapshot = await getDocs(query(CONTENTS_COLLECTION, where("owner", "==", user.uid)));
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
  async function voteOnPost(id: string, voteType: "upvote" | "downvote", owner: string) {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    const contentId = ethers.encodeBytes32String(id);
    let tx: ContractTransactionResponse;
    try {
      if (voteType === "upvote") {
        tx = await EMTMarketPlaceWithSigner.upVoteContent(contentId);
      } else if (voteType === "downvote") {
        tx = await EMTMarketPlaceWithSigner.downVoteContent(contentId);
      }
      await tx!.wait();
      const [_upvotes, _downvotes] = await EMTMarketPlace.contentVotes(contentId);
      console.log("voted. New votes: ", { upvotes: _upvotes, downvotes: _downvotes });

      createNotification({type: voteType, contentId: id, recipients: [user.uid],})
      
      return { upvotes: Number(_upvotes), downvotes: Number(_downvotes) };
    } catch (err: any) {
      console.log(err);
      throw new Error("Error voting on content. Message: " + err.message);
    }

  }

  async function followUser(id: string) {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const userFollowersRef = doc(USERS_COLLECTION, id, "followers", user?.uid!);
      //check if is already following
       //TODO: @Jovells enforce this at rules level and remove this check to avoid extra roundrtip to db
       if (await checkFollowing(id)) return false;

      await setDoc(userFollowersRef, { timestamp: serverTimestamp() });

      createNotification({type: "follow", recipients: [id],})

      return true;
    } catch (err: any) {
      throw new Error("Error following user. Message: " + err.message);
    }
  }

  async function unfollowUser(id: string) {
    try {
      const userFollowersRef = doc(USERS_COLLECTION, id, "followers", user?.uid!);
      //check if is already following
       //TODO: @Jovells enforce this at rules level and remove this check to avoid extra roundrtip to db
      if (await checkFollowing(id)) return false;

      await deleteDoc(userFollowersRef)
      return true;
    } catch (err: any) {
      throw new Error("Error unfollowing user. Message: " + err.message);
    }
  }

  /**
   * Updates the user profile.
   * @param updates - The profile updates.
   * @throws Error if there is an error updating the user profile.
   */
  async function updateProfile(updates: { displayName?: string; profilePicture?: File; about?: string; username?: string; email?: string }) {
    const _updates: { [key: string]: string | File } = { ...updates };
    if (updates.profilePicture) {
      try {
        const imageURL = await uploadImage(updates.profilePicture, user?.uid!, "profilePictures");
        _updates.photoURL = imageURL;
        delete _updates.profilePicture;
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    try {
      await updateUser(_updates);
    } catch (err: any) {
      throw new Error("Error updating user profile. Details: " + err.message);
    }
  }

  async function checkFollowing(id: string) {
    try {
      const userFollowersRef = doc(USERS_COLLECTION, id, "followers", user?.uid!);
      const userFollowersSnap = await getDoc(userFollowersRef);
      return !!userFollowersSnap.exists();
    } catch (err:any) {
      console.log("err", err.message);
    }
      return false;
  }

  

  return { createPost, updateProfile, fetchNotifications, fetchUserPosts, uploadImage, followUser, unfollowUser, fetchPosts, fetchProfile, checkFollowing, voteOnPost, fetchSinglePost };
}
