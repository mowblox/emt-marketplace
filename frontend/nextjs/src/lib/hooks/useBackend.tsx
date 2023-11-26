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
import { firestore, storage } from "../firebase";
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
import { Content, PostFilters, User } from "@/lib/types";

const db = firestore;

/**
 * Uploads an image to Firebase Storage.
 * @param image - The image to upload.
 * @param name - The name of the image.
 * @param subpath - The subpath to store the image in.
 * @returns The URL of the uploaded image.
 */
async function uploadImage(image: Blob, name: string, subpath?: string) {
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

  /**
   * Fetches the metadata of a post.
   * @param owner - The owner of the post.
   * @param id - The ID of the post as stored in Firestore.
   * @returns The author and metadata of the post.
   */
  async function fetchPostMetadata(owner: string, id: string) {
    const userDocRef = doc(db, "users", owner);
    const userDoc = await getDoc(userDocRef);
    const author = userDoc.data() as Content["author"];
    const contentId = ethers.encodeBytes32String(id);
    const [_upvotes, _downvotes] = await EMTMarketPlace.contentVotes(contentId);
    return { author, metadata: { upvotes: Number(_upvotes), downvotes: Number(_downvotes), id } };
  }
  
  async function fetchSinglePost(id: string) {
    const docRef = doc(db, "contents", id);
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
    const userDocRef = doc(db, "users", id);
    const userDoc = await getDoc(userDocRef);
    const profile : User = userDoc.data() as User;
    return profile;
  }

  /**
   * Fetches posts from the database.
   * @param lastDocTimeStamp - The timestamp of the last document.
   * @param size - The number of posts to fetch.
   * @returns An array of fetched posts.
   */
  async function fetchPosts(lastDocTimeStamp?: Timestamp, size = 1, filters?: PostFilters): Promise<Content[]> {
    let q = query(collection(db, "contents"), orderBy("timestamp", "desc"), limit(size))

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

    const posts: Content[] = [];

    for (const doc of querySnapshot.docs) {
      const post = doc.data() as Content["post"];
      const { author, metadata } = await fetchPostMetadata(post.owner, doc.id);
      posts.push({ post, author, metadata });
    }
    console.log("posts", posts);
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
  }, [user, provider]);

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
    const docRef = doc(collection(db, "contents"));
    const id = ethers.encodeBytes32String(docRef.id);
    try {
      console.log("id", id);
      const tx = await EMTMarketPlaceWithSigner.addContent(id);
      console.log("iwaiyd", EMTMarketPlaceWithSigner);
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
        owner: user?.address,
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
    const querySnapshot = await getDocs(query(collection(db, "contents"), where("owner", "==", user.address)));
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
   */
  async function voteOnPost(id: string, voteType: "upvote" | "downvote") {
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
      return { upvotes: Number(_upvotes), downvotes: Number(_downvotes) };
    } catch (err: any) {
      console.log(err);
      throw new Error("Error voting on content. Message: " + err.message);
    }
  }

  async function followUser(id: string) {
    try {
      const userFollowersRef = doc(db, "users", id, "followers", user?.address!);
      //check if is already following
       //TODO: @Jovells enforce this at rules level and remove this check to avoid extra roundrtip to db
       if (await checkFollowing(id)) return false;

      await setDoc(userFollowersRef, { timestamp: serverTimestamp() });
      return true;
    } catch (err: any) {
      throw new Error("Error following user. Message: " + err.message);
    }
  }

  async function unfollowUser(id: string) {
    try {
      const userFollowersRef = doc(db, "users", id, "followers", user?.address!);
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
        const imageURL = await uploadImage(updates.profilePicture, user?.address!, "profilePictures");
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
      const userFollowersRef = doc(db, "users", id, "followers", user?.address!);
      const userFollowersSnap = await getDoc(userFollowersRef);
      return !!userFollowersSnap.exists();
    } catch (err:any) {
      console.log("err", err.message);
    }
      return false;
  }

  

  return { createPost, updateProfile, fetchUserPosts, followUser, unfollowUser, fetchPosts, fetchProfile, checkFollowing, voteOnPost, fetchSinglePost };
}
