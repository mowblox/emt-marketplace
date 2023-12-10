"use client";
import { POST_PAGE, PROFILE_PAGE } from "@/app/(with wallet)/_components/page-links";
import { BuiltNotification, ClaimHistoryItem, Content, ExptListing, NotificationData, PostFilters, UserProfile } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { formatDistance } from 'date-fns';
import { ContractTransactionReceipt, ContractTransactionResponse, ethers } from "ethers6";
import { QueryDocumentSnapshot, Timestamp, collection, collectionGroup, deleteDoc, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, startAfter, where
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { useEffect, useState } from "react";
import { CLAIM_HISTORY_COLLECTION, CONTENTS_COLLECTION, EXPT_LISTINGS_COLLECTION, NOTIFICATIONS_COLLECTION, USERS_COLLECTION } from "../../../emt.config";
import { firestore, storage } from "../firebase";
import { useContracts } from "./contracts";
import { useUser } from "./user";


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
  const { EMTMarketPlace, MentorToken, ExpertToken, StableCoin, provider } = useContracts();
  const { user, updateUser } = useUser();
  const [EMTMarketPlaceWithSigner, setEmtMarketPlaceWithSigner] = useState(EMTMarketPlace);
  const[signer, setSigner] = useState<ethers.Signer>();

  //for admin
  async function togglePause(){
    try {

      const tx = await EMTMarketPlaceWithSigner.pause().catch(err=>{
        console.log("Error pausing contract. Details: " + err);
        return EMTMarketPlaceWithSigner.unpause();
      }
        );
      await tx!.wait();
      console.log("contract paused")
    } catch (err) {
      console.log("Error unpausing contract. Details: " + err);
    }
  }

  //queries

  //TODO: @Jovells FIX THIS
  const {data: exptLevels} = useQuery({
    queryKey: ['exptlevels'],
    queryFn: ()=>{
      const levels = {1: {requiredMent: 10,
                          receivableExpt: 10},
                        2: {requiredMent: 20,
                        receivableExpt: 20},
                        3: {requiredMent: 30,
                          receivableExpt: 30}
                        }
                        return levels
    }
  })

  const {data: currentUserMent} = useQuery({
    queryKey: ['ment', user?.uid],
    queryFn: () =>fetchMent(),
    enabled: !!user?.uid,
  })

  
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
  async function saveClaimHistoryItemToFirestore(item: ClaimHistoryItem){ 
    try {
      const docRef = doc(CLAIM_HISTORY_COLLECTION);
      await setDoc(docRef, item);
    }
    catch (err: any) {
      console.log(`Error saving ${item.type} claim history item to firestore. Message: ` +err);
      throw new Error("Error saving claim history item to firestore. Message: " + err.message);
    }

  }
  async function claimMent(){
    function getMentClaimed(receipt: ContractTransactionReceipt){
      const filter = EMTMarketPlace.filters.MentClaimed().fragment
      let mentClaimed: number
      console.log('addess', )
      // console.log(receipt?.logs)
      receipt?.logs.some(log => {const d = EMTMarketPlace.interface.decodeEventLog(filter, log.data);
      console.log('l',d)
      mentClaimed = Number(d[1])
      return false
      })
      console.log('mentClaimed', currentUserMent!);
    }
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const tx = await EMTMarketPlaceWithSigner.claimMent();
      const receipt = await tx!.wait();
      console.log("claimed ment");
      const mentClaimed = receipt && getMentClaimed(receipt)
      const historyItem: ClaimHistoryItem = {
        type: "ment",
        amount: currentUserMent!,
        timestamp: serverTimestamp(),
        uid: user.uid
      }
      await saveClaimHistoryItemToFirestore(historyItem);
      return mentClaimed;
    } catch (err: any) {
      console.log(err);
      throw new Error("Error claiming ment. Message: " + err.message);
    }
  }

  async function getLevel(uid=user?.uid){
    console.log('getLevel', uid)
    let ment = currentUserMent
    if (uid !== user?.uid){
       ment = await fetchMent(uid)
    }
    const level = exptLevels ? Object.entries(exptLevels).find(([key, level])=> (ment || 0) >level.requiredMent )?.[0]  : 1
    return Number(level) || 1
  }



  async function claimExpt(){
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      const level = await getLevel()

      if(!level){
        throw new Error('Not qualified for expt')
      }
      const tx = await EMTMarketPlaceWithSigner.claimExpt(level)
      await tx!.wait();
      const val = await ExpertToken.balanceOf(user.uid);
      const expt = Number(val);
      
      const historyItem: ClaimHistoryItem = {
        type: "expt",
        amount: expt,
        level: level,
        timestamp: serverTimestamp(),
        uid: user.uid
      }
      await saveClaimHistoryItemToFirestore(historyItem)
      console.log("claimed expt. New expt: ", expt);
      return expt;
    } catch (err: any) {
      console.log(err);
      throw new Error("Error claiming ment. Message: " + err.message);
    }
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
  async function fetchSingleListing(id: string) {
    const docRef = doc(EXPT_LISTINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const listing = docSnap.data() as ExptListing;
      return listing;
    } else {
      throw new Error("Error Fetching Listing "+ id);
    }
  }

  async function fetchNumFollowers(id: string) {
    const userFollowersRef = collection(USERS_COLLECTION, id, "followers");
    const querySnapshot = await getCountFromServer(query(userFollowersRef));
    const count = querySnapshot.data().count;
    console.log('fetchNumFollowers', count)
    return count;
  }

  async function fetchNumFollowing(id: string) {
    const q = query(collectionGroup(firestore, 'followers'), where('uid', "==", id));
    const querySnapshot = await getCountFromServer(q);
    const count = querySnapshot.data().count;
    console.log('fetchNumFollowing', count)
    return count;
  }

  async function fetchUserDoc(id: string) {
    console.log('fetching user doc', id)
    const userDocRef = doc(USERS_COLLECTION, id);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data() as UserProfile;
    data && (data.uid = id);
    console.log('fetched user doc')
    return data;
  }



  async function fetchMent(address= user?.uid){
    console.log('fetching ment', address)
    try {
      const val = await MentorToken.balanceOf(address!)
      const ment = Number(val);
      console.log('ment:', ment)
      return ment;
    } catch (err:any) {
      console.log("Error fetching ment. Details: " + err);
      throw new Error(err);
    }
  }
  async function fetchUnclaimedMent(){
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      console.log('unclaimed ment fetching');
      const val = await EMTMarketPlace.unclaimedMent(user.uid);
      console.log('unclaimed ment:', val);
      const unclaimedMent = Number(val);
      return unclaimedMent;
    } catch (err:any) {
      console.log("Error fetching unclaimed ment. Details: " + err);
      throw new Error(err);
    }
  }

  async function fetchUnclaimedExpt() {
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      console.log('fetching unclaimed expt')
      const level = await getLevel()
      const val = await EMTMarketPlace.unclaimedExpt(user.uid, level);
      const unclaimedExpt = Number(val);
      console.log('unclaimed expt:', unclaimedExpt)
      return unclaimedExpt;
    } catch (err:any) {
      if(err.message.includes("Not qualified for level") || err.message.includes('Level has already been claimed')){
        return 0
      }else
      {
        console.log("Error fetching expt. Details: " + err);
        throw new Error(err);
      }
    }
    
  }

  async function fetchProfile(uid: string) {
    try {
      const [user, numFollowers, numFollowing, ment, level] = await  Promise.all(
        [fetchUserDoc(uid),
        fetchNumFollowers(uid),
        fetchNumFollowing(uid),
        //TODO: @Jovells update to use already fetched meant if iscurrent user profile
        fetchMent(uid),
        getLevel(uid)
      ]
        );
      const profile : UserProfile = {...user, level, numFollowers, numFollowing, ment};
     
      console.log('fetched Profile', profile.uid)
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

    console.log("postFilters", filters)
    
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
    async function connectToSigner() {
      const _signer = await provider.getSigner();
      setSigner(_signer);
      setEmtMarketPlaceWithSigner(EMTMarketPlace.connect(_signer));
    }
    if (user && provider) {
      connectToSigner();
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
    console.log("writing to blockchain", post);
    const docRef = doc(CONTENTS_COLLECTION);
    const id = ethers.encodeBytes32String(docRef.id);
    try {
      console.log("emtMarketPlaceWithSigner", EMTMarketPlaceWithSigner);
      const tx = await EMTMarketPlaceWithSigner.addContent(id);
      const receipt = await tx.wait();

      console.log("Content added to blockchain. Receipt:", receipt );
    } catch (err: any) {
      console.log("Error writing to blockchain. Details: " + err.message);
      throw new Error("Error writing to blockchain. Details: " + err.message);
    }
    let imageURL = "";

    if (post.image) {
      try {
        console.log("uploading image");
        imageURL = await uploadImage(post.image, docRef.id, "contentImages");
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    try {
      console.log("writing to database")
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
  async function listExpts(listing: Omit<ExptListing, 'id'>){

    async function saveExptListingToFirestore(listing: Omit<ExptListing, 'id'>){
      try {
        const docRef = doc(EXPT_LISTINGS_COLLECTION);
        await setDoc(docRef, listing);
        console.log("saved expt listing to firestore")
        return docRef.id;
      } catch (err: any) {
        console.log(`Error saving expt listing to firestore. Message: ` +err);
        throw new Error("Error saving expt listing to firestore. Message: " + err.message);
      }
    }
    if (!user?.uid) {
      throw new Error("User not logged in");
    }
    try {
      // await ExpertToken.connect(signer).setApprovalForAll(EMTMarketPlace.target, true)
      // console.log("listing expts in contract")
      // const tx = await EMTMarketPlaceWithSigner.offerExpts(listing.tokenIds, StableCoin.target, listing.price )
      // await tx!.wait();
      // console.log("listed expts in contract");
      const id = await saveExptListingToFirestore(listing);
      return id;
    } catch (err: any) {
      console.log(err);
      throw new Error("Error listing expts. Message: " + err.message);
    }
  }

  async function fetchExptListings(lastDocTimeStamp?: Timestamp, size = 1, filters?: PostFilters): Promise<ExptListing[]> {
    let q = query(EXPT_LISTINGS_COLLECTION, orderBy("timestamp", "desc"), limit(size))

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

    console.log("postFilters", filters)
    
    const querySnapshot = await getDocs(q);

  const listings = querySnapshot.docs.map( (doc) => {
      const listing = doc.data() as ExptListing;
      listing.id = doc.id
      return listing
    })
    return listings;
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

  async function fetchClaimHistory(uid=user?.uid){
    try {
      const historySnap = await getDocs(query(CLAIM_HISTORY_COLLECTION, where('uid', '==', uid), orderBy('timestamp', 'desc')));
      const history = historySnap.docs.map(doc=>{
        const data = doc.data();
        data.dateClaimed = formatDistance(data.timestamp.toDate(), new Date(), { addSuffix: true })
        return data
      } 
      )
      return history as ClaimHistoryItem[]
    } catch (err) {
      console.log("error fetching claim history. ", err )
    }
  }

  const profileReady = exptLevels !== undefined && currentUserMent !== undefined 

  

  return { createPost, fetchClaimHistory, fetchExptListings, fetchSingleListing, listExpts, profileReady, togglePause, updateProfile, fetchUnclaimedExpt, fetchUnclaimedMent, fetchMent, claimMent, claimExpt, fetchNotifications, fetchUserPosts, uploadImage, followUser, unfollowUser, fetchPosts, fetchProfile, checkFollowing, voteOnPost, fetchSinglePost };
}
