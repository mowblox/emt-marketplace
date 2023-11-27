"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession, signOut as signOutNextAuth } from "next-auth/react";
import axios from "axios";
import { auth, firestore } from "@/lib/firebase";
import { signInWithCustomToken, signOut, onAuthStateChanged,  } from "firebase/auth";
import {  doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {SignUpData, User} from '@/lib/types'
import { FirebaseError } from "firebase-admin";

interface UserContext {
  user: User | null;
  updateUser: (data: {username?: string, photoURL?: string, displayName?: string, email?: string}) => Promise<void>;
  isLoading: boolean;
  signUpDataRef: React.MutableRefObject<SignUpData | null>;
  signIn: () => Promise<void>;
  isMultipleSignUpAttempt: boolean;
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

export function UserProvider({ children, signUpDataRef }: { children: React.ReactNode, signUpDataRef: React.MutableRefObject<SignUpData | null> }) {
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status, update }: {[key:string]: any}  = useSession(); 
  const [isLoading, setIsLoading] = useState(false);

  async function updateUser(data: {username?: string, photoURL?: string, displayName?: string, email?: string, tags?: string[]}) {
    // const userDocRef = doc(firestore, 'users', session?.address); 
    // await updateDoc(userDocRef, data);
    await update(data);
    setUser({...user!, ...data});
  }

    const signIn = useMemo(() => async function (){
      try {
        setIsLoading(true);
        const token = session.firebaseToken;

        const userData = await signInWithCustomToken(auth, token);

          setUser(userData.user as User);

        signUpDataRef.current = null;
        if (session?.isMultipleSignUpAttempt) {
          update({resetMultipleSignUpAttempt: true})
        }
      } catch (err: FirebaseError | any ) {
        if( err.code === 'auth/invalid-custom-token')
        signOutNextAuth();
      }
      finally{
        setIsLoading(false);
      }
      
}, [session?.address, session?.firebaseToken])  

  useEffect(() => {
    


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
    if (session?.isMultipleSignUpAttempt) {
      return
    }
    if (session?.address && !user) {
      signIn();
    }


  }, [session?.address, session?.firebaseToken, signIn])
  




  return (
    <UserContext.Provider value={{user, signIn, updateUser, isLoading, signUpDataRef, isMultipleSignUpAttempt: session?.isMultipleSignUpAttempt}}>{children}</UserContext.Provider>
  );
}
