"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { auth, firestore } from "@/lib/firebase";
import { signInWithCustomToken, signOut, onAuthStateChanged,  } from "firebase/auth";
import {  doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface User {
  address: string;
  displayName?: string,
  email?: string;
  isAuthenticated?: boolean;
  photoUrl?: string,
}

interface UserContext {
  user: User | null;
  updateUser: (data: {username?: string, photoUrl?: string, displayName?: string, email?: string}) => void;
  isLoading: boolean;
}

declare global {
    interface Window {
      ethereum: any;
    }
  }

const UserContext = createContext<UserContext | null>(null);

export function useUser(): UserContext {
  const userContext = useContext(UserContext);

  return userContext!;


}

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const { data: session, status } : {data: any, status: string}  = useSession(); 
  const [isLoading, setIsLoading] = useState(false);

  async function updateUser(data: {username?: string, photoUrl?: string, displayName?: string, email?: string}) {
    const userDocRef = doc(firestore, 'users', session?.address); // Replace 'users' with your collection name
    await updateDoc(userDocRef, data);
  }

  useEffect(() => {
    

    async function signIn(){
      
          try {
            setIsLoading(true);
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const res = await axios.post(baseUrl + '/api/getToken', {
              address: session?.address })
            const token = res.data.token;
            const userData = await signInWithCustomToken(auth, token);
            //get user data from fireStore
            const userDocRef = doc(firestore, 'users', session.address); // Replace 'users' with your collection name
            const userDocSnap = await getDoc(userDocRef);
      
            if (userDocSnap.exists()) {
              //@ts-ignore
              setUser({  ...userDocSnap.data() });
            } else {
              const newUser = { address: session?.address};
              await setDoc(userDocRef, newUser);
              //@ts-ignore
              setUser(newUser);
            }
          } catch (err:any) {
            throw new Error(err);
          }
          finally{
            setIsLoading(false);
          }
          
    }
    async function _signOut(){
      setIsLoading(true)
      signOut(auth).then(() => {
        console.log('User signed out');
        setUser(null);
      }).catch((error) => {
        console.error('Error signing out: ', error);
      });
      setIsLoading(false)
    }

    if (status === 'unauthenticated' && user) {
      _signOut();
    }
    if (session?.address && !user) {
      signIn();
    }


  }, [session?.address])
  




  return (
    <UserContext.Provider value={{user, updateUser, isLoading}}>{children}</UserContext.Provider>
  );
}
