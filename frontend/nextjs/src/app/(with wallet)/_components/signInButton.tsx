"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/user";
import { isEmpty } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ONBOARDING_PAGE } from "./page-links";
import { is } from "date-fns/locale";
import {chain} from "@/../emt.config"
import { useQuery } from "@tanstack/react-query";
import useBackend from "@/lib/hooks/useBackend";
import { Separator } from "@/components/ui/separator";

/**
 * Props for the SignInButton component.
 */
interface SignInButtonProps extends ButtonProps {
  /**
   * The URL to navigate to when the button is clicked.
   * if provided, the button will not open the connect modal.
   */
  href?: string;

  /**
   * The label text for the button.
   */
  label?: string;

  /**
   * An function to run anything else when the button is clicked.
   */
  before?: () => void;
}
interface SignInButtonProps extends ButtonProps  {
  href?: string
  mobile?: boolean
  label?: string
}

export const SignInButton = ({ label, href, mobile, before }: SignInButtonProps) => {
  const { user, isLoading, session, signIn } = useUser();
  const {balances, refetchBalances} = useBackend()
  
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain : currentChain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const wrongChain = chain.id !== currentChain?.id;
        const ready = mounted && authenticationStatus !== "loading";
        const isConnected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        const signedIn = isConnected && user;
        return (
          <div
            className="w-full"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}>
            {(() => {
              if(!isConnected){
                console.log('not connectd')
                return(
                  <Button variant={"default"} onClick={openConnectModal} className="w-full">
                  {label || "Connect Wallet"}
                </Button>
                )
              }
              if(isConnected && session?.isNotSignedUp){
                console.log('not signed up')
                return (
                  <Button variant={"default"} asChild className="w-full">
                    <Link href={ONBOARDING_PAGE(2)}>Sign Up</Link>
                  </Button>
                );
              }
              if (isConnected && !signedIn) {
                console.log('not signed in')
                // if (isConnected ) signOut({redirect:false}) 
                return (
                  <Button variant={"default"} onClick={()=>(signIn())} className="w-full">
                    {isLoading? "...Signing In": label || "Sign In"}
                  </Button>
                );
              }
              if (wrongChain) {
                return (
                  <Button variant={"default"} onClick={()=> (openChainModal())} className="w-full">
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className={`flex ${mobile? "flex-col" : "flex-row"} gap-3`}>
                   <Button variant={'light'} onClick={()=>console.log(refetchBalances('USDT'))} className={"flex flex-row items-center justify-center"}>
                    <span>{balances['USDT']} USDT</span>
                    <Separator orientation="vertical" className="mx-3"/>
                    <span>{balances[chain.nativeCurrency.symbol]} {chain.nativeCurrency.symbol}</span>
                    </Button>
                  <Button variant={"default"} onClick={()=>(openAccountModal())} className="w-full">
                    {account.displayName}
                  </Button>

                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
