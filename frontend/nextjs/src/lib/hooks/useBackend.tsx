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
import { ethers } from "ethers6";

export default function useBackend() {
  const { EMTMarketPlace, provider } = useContracts();
  const { user } = useUser();
  const [EMTMarketPlaceWithSigner, setEmtMarketPlaceWithSigner] = useState(EMTMarketPlace);

  useEffect(() => {
      async function setSigner() {
        const signer = await provider.getSigner();
          setEmtMarketPlaceWithSigner(EMTMarketPlace.connect( signer));
          console.log('signer', signer)
      }
    if (user && provider) {
        setSigner();
    }
  }
  , [user, provider])


  const db = firestore;

  async function createPost(post: {
    title: string;
    body: string;
    image?: Blob;
  }) {
    const docRef = doc(collection(db, "contents"));
    const id = ethers.encodeBytes32String(docRef.id);
    console.log("id", id);
    try {
      const tx = await EMTMarketPlaceWithSigner.addContent(id);
        await tx.wait();
      console.log("Content added to blockchain");
    } catch (err: any) {
      throw new Error("Error writing to blockchain. Details: " + err.message);
    }
    let imageUrl= "";

    if (post.image) {
      try {
        const storageRef = ref(storage, "images/" + docRef.id);
        const uploadResult = await uploadBytes(storageRef, post.image);
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log("File available at", imageUrl);
      } catch (err: any) {
        throw new Error("Error uploading image. Details: " + err.message);
      }
    }

    try {
      await setDoc(docRef, {
        title: post.title,
        body: post.body,
        owner: user?.address,
        imageUrl: imageUrl,
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
      throw new Error("Error writing to database. Details: " + err.message);
    }
    console.log("Document written with ID: ", docRef.id);
    return { contentId: docRef.id, imageUrl };
  }

  async function fetchUserPosts() {
    if (!user) {
      return [];
    }
    const querySnapshot = await getDocs(
      query(collection(db, "contents"), where("owner", "==", user.address))
    );
    const posts = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });

    return posts;
  }

  return { createPost };
}
