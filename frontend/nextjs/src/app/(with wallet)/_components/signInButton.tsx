"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/user";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link'
import { ONBOARDING_PAGE } from "./page-links";

export const SignInButton = ({ label }: { label?: string }) => {
  const { user, isLoading, session, signIn, signUpDataRef } = useUser();
  const pathname = usePathname()

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
              if (!signedIn) {
                return isConnected ? (
                  <div className="flex gap-2 items-center">

                    <Button variant={"default"} size="sm" onClick={signIn}>

                      {session?.isNotSignedUp ? "Sign up" : isLoading ? "Signing in..." : "Sign in"}
                    </Button>

                    <Button variant="outline" size="sm">
                      <Link
                        href={ONBOARDING_PAGE()}>
                        New Account
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Button variant={"ghost"} size="sm" onClick={openConnectModal}>
                      {label || "Connect Wallet"}
                    </Button>

                    <Button variant="outline" size="sm">
                      <Link
                        href={ONBOARDING_PAGE()}>
                        New Account
                      </Link>
                    </Button>
                  </div>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button variant={"outline"} size="sm" onClick={openChainModal}>
                    Wrong network
                  </Button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Button variant={"outline"} size="sm" onClick={openAccountModal}>
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
