"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut as signOutNextAuth, signIn as signInNextAuth } from "next-auth/react";
import axios from "axios";
import { auth, firestore } from "@/lib/firebase";
import { signInWithCustomToken, signOut, onAuthStateChanged, } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { SignUpData, User, UserSession } from '@/lib/types'
import { redirect, usePathname, useRouter } from "next/navigation";
import { HOME_PAGE, PROTECTED_ROUTES } from "@/app/(with wallet)/_components/page-links";
import { uploadImage } from "./useBackend";
import { toast } from "@/components/ui/use-toast";
import { ethers } from "ethers6";
import { useContracts } from "./useContracts";

interface UserContext {
  user: User | null;
  isLoading: boolean;
  signIn: (options?:{redirect?:boolean}) => Promise<void>;
  signUp: () => Promise<UserSession>;
  validateSignUpData: () => Promise<{email: boolean, username: boolean}>;
  isMultipleSignUpAttempt: boolean | undefined;
  session: UserSession | null;
  signUpData: SignUpData;
}



const UserContext = createContext<UserContext | null>(null);

export function useUser(): UserContext {
  const userContext = useContext(UserContext);
  return userContext!;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { data: session, status, update }: { data: UserSession | null} & ReturnType<typeof useSession>  = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const signUpDataRef = useRef<SignUpData>({});
  const signUpData = signUpDataRef.current;

  const router = useRouter();
  const pathname = usePathname()

  async function validateSignUpData() {
    const result = await update({validateSignUpData: signUpData}) as UserSession;
    return result.validateSignUpResult!;
  }

  async function signUp (redirect=true) {
    console.log('signing Up', signUpData)
    const t = toast({
      variant:"default",
      title: "SignIng Up",
      duration: Infinity,
    })
    const data = {...signUpData}
    delete data.profilePicture

    const updateResult = await update({ signUpData: data }) as UserSession;
    console.log('updateResult', updateResult)
    if (updateResult?.error){
      t.update({variant:"destructive", id:t.id, duration: 1000})
      return updateResult
      }
    let photoURL
    if (signUpData.profilePicture) {
      console.log('uploading pic')
      photoURL = await uploadImage(signUpData.profilePicture, session?.address!, 'profilePictures');
      await update({updates: {photoURL: photoURL}});
    }

    setUser({ ...user, ...signUpData, photoURL});
    t.update({id:t.id, title:"Successful", duration: 1000})
    if (redirect) router.push(HOME_PAGE)
    return updateResult;

  }

  const signIn = useMemo(() => async function (options?:{redirect?: boolean }) {
    try {
      setIsLoading(true);
      if (session?.firebaseToken) {
        console.log("signing in");
        const signInResult = await signInWithCustomToken(auth, session.firebaseToken);
        console.log("signing in", signInResult);
        setUser(signInResult.user);
      }
      else {
        await update({ signIn: true });
      }
        if (options?.redirect === false) return
        router.push(HOME_PAGE)

    } catch (err: any) {
      console.log("sign in error", err);
      if (err.code === 'auth/invalid-custom-token')
        signOutNextAuth();
    }
    finally {
      setIsLoading(false);
    }
  }, [session?.firebaseToken])

  useLayoutEffect(()=>{
    if(isLoading){
      return
    }
    if (PROTECTED_ROUTES.some( route=> pathname.startsWith(route)) && !user ){
      router.push(HOME_PAGE)
    }
  },[pathname, user, isLoading])


  useEffect(() => {

    async function _signOut() {
      setIsLoading(true)
      signOut(auth).then(() => {
        console.log('User signed out');
        setUser(null);
        router.push(HOME_PAGE)
      }).catch((error) => {
        console.error('Error signing out: ', error);
      });
      setIsLoading(false)
    }
    //logged in to next auth but not firebase
    if (status === 'unauthenticated' && user) {
      _signOut();
    }
    //logged in to next auth
    if (session?.firebaseToken) {
      signIn({redirect: false})
    }
    else{
      setIsLoading(false)
    }
  }, [session?.firebaseToken, user?.uid])

  return (
    <UserContext.Provider value={{ user, signUp, signIn, validateSignUpData, signUpData, isLoading, session, isMultipleSignUpAttempt: session?.isMultipleSignUpAttempt }}>{children}</UserContext.Provider>
  );
}
