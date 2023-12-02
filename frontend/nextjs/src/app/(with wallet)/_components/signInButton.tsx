"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/user";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
                  <Button variant={"default"} onClick={signIn}>

                    {session?.isNotSignedUp? "Sign up": isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                ) : (
                  <Button variant={"default"} onClick={openConnectModal}>
                    {label || "Connect Wallet"}
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button variant={"default"} onClick={openChainModal}>
                    Wrong network
                  </Button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Button variant={"default"} onClick={openAccountModal}>
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
