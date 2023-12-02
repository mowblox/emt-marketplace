"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession, signOut as signOutNextAuth, signIn as signInNextAuth } from "next-auth/react";
import axios from "axios";
import { auth, firestore } from "@/lib/firebase";
import { signInWithCustomToken, signOut, onAuthStateChanged,  } from "firebase/auth";
import {  doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {SignUpData, User, UserSession} from '@/lib/types'
import { FirebaseError } from "firebase-admin";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { Session } from "next-auth";
import { redirect, useRouter } from "next/navigation";
import { isEmpty } from "../utils";

interface UserContext {
  user: User | null;
  updateUser: (data: {username?: string, photoURL?: string, displayName?: string, email?: string}) => Promise<void>;
  isLoading: boolean;
  signUpDataRef: React.MutableRefObject<SignUpData | null>;
  signIn: () => Promise<void>;
  isMultipleSignUpAttempt: boolean | undefined;
  session: UserSession | null;
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
  const { data: session, status, update }: { data: UserSession | null , [key:string]: any}  = useSession(); 
  const [isLoading, setIsLoading] = useState(false);
  const { openConnectModal } = useConnectModal();

  const router = useRouter();

  async function updateUser(data: {username?: string, photoURL?: string, displayName?: string, email?: string, tags?: string[]}) {
    // const userDocRef = doc(firestore, 'users', session?.address); 
    // await updateDoc(userDocRef, data);
    await update(data);
    setUser({...user!, ...data});
  }


    const signIn = useMemo(() => async function (){
      try {
        setIsLoading(true);
        const token = session?.firebaseToken;

        if (!token) {
          console.log('sess', session, signUpDataRef.current)
          if(session?.isNotSignedUp && isEmpty(signUpDataRef.current as any)){
            return router.push('/onboarding')
          }

          signOutNextAuth({redirect: false});
          return
          // await signOutNextAuth({redirect: false});
          // openConnectModal!();
        }

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
    <UserContext.Provider value={{user, signIn, updateUser, isLoading, signUpDataRef, session, isMultipleSignUpAttempt: session?.isMultipleSignUpAttempt}}>{children}</UserContext.Provider>
  );
}
