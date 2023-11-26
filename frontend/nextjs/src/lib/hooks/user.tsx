"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { auth, firestore } from "@/lib/firebase";
import { signInWithCustomToken, signOut, onAuthStateChanged,  } from "firebase/auth";
import {  doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {User} from '@/lib/types'

interface UserContext {
  user: User | null;
  updateUser: (data: {username?: string, photoURL?: string, displayName?: string, email?: string}) => Promise<void>;
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

  async function updateUser(data: {username?: string, photoURL?: string, displayName?: string, email?: string, tags?: string[]}) {
    const userDocRef = doc(firestore, 'users', session?.address); 
    await updateDoc(userDocRef, data);
    setUser({...user!, ...data});
  }

  useEffect(() => {
    

    async function signIn(){
      
          try {
            setIsLoading(true);

            // const token = session.firebaseToken
            const token = session.firebaseToken;
            const userData = await signInWithCustomToken(auth, token);
            //get user data from fireStore
            const userDocRef = doc(firestore, 'users', userData.user.uid); 
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


  }, [session?.address, session.firebaseToken])
  




  return (
    <UserContext.Provider value={{user, updateUser, isLoading}}>{children}</UserContext.Provider>
  );
}
