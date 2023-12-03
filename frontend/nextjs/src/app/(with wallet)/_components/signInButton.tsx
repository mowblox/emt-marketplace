"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/user";
import { isEmpty } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { ONBOARDING_PAGE } from "./page-links";
import { is } from "date-fns/locale";

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
  
  label?: string
}

export const SignInButton = ({ label, href, before }: SignInButtonProps) => {
  const { user, isLoading, session, signIn } = useUser();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const isConnected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        const signedIn = isConnected && user;
        return (
          <div
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
                  <Button variant={"default"} onClick={openConnectModal}>
                  {label || "Connect Wallet"}
                </Button>
                )
              }
              if(isConnected && session?.isNotSignedUp){
                console.log('not signed up')
                return (
                  <Button variant={"default"} asChild>
                    <Link href={ONBOARDING_PAGE()}>Sign Up</Link>
                  </Button>
                );
              }
              if (isConnected && !signedIn) {
                console.log('not signed in')
                // if (isConnected ) signOut({redirect:false}) 
                return (
                  <Button variant={"default"} onClick={()=>(signIn())}>
                    {isLoading? "...Signing In": label || "Sign In"}
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button variant={"default"} onClick={()=> (openChainModal())}>
                    Wrong network
                  </Button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Button variant={"default"} onClick={()=>(openAccountModal())}>
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
