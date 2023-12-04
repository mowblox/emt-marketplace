'use client';
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/hooks/user"
import { UserSession } from "@/lib/types"
import Link from "next/link"
import { SignInButton } from "../../_components/signInButton"
import { ONBOARDING_PAGE } from "../../_components/page-links"

export default function ButtonToShow(){
    const{signIn, session} = useUser();

    if(session?.firebaseToken){
      return (
        <Button onClick={()=>signIn()}>
          User Exists. Sign In.
        </Button>
      )}
    if(session){
      return (
        <Button asChild className='w-full'>
          <Link href={ONBOARDING_PAGE(2)}>Get Started</Link>
        </Button>
      )
    }else{
      return (
        <SignInButton label='Connect Wallet to Get Started' className='w-full'/>
      )
    }
  }