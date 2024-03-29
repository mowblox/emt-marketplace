import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import { collection } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

import { chain, envChains } from "./contracts";
import { HOME_PAGE } from "@/app/(with wallet)/_components/page-links";

const { chains, publicClient } = configureChains(envChains, [publicProvider()]);

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

/**
 * Creates a custom metamask connector that opens the app in the metamask app if the user is on mobile.
 * 
 */
const customMetamaskWallet = metaMaskWallet({ projectId, chains });
/**
 * modify the createConnector function to return a custom connector
 */
customMetamaskWallet.createConnector = () => {
  const newConnector = metaMaskWallet({ projectId, chains }).createConnector();
  const oldMobileGetUri = newConnector.mobile!.getUri;
  /**
   * modify the getUri function to return a custom uri
   */
  newConnector.mobile!.getUri = async () => {
    /**
     * if the user is not in the matamask browser, return the default uri
     */
    if (window?.ethereum) {
      return oldMobileGetUri as any;
    }
    /**
     * if the user is in the metamask browser, return a custom uri
     */
    return "https://metamask.app.link/dapp/" + location.origin + HOME_PAGE;
  };
  return newConnector;
};

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      customMetamaskWallet,
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const emtChains = chains;
export const emtWagmiConfig = wagmiConfig;
export { chain };

export const USERS_COLLECTION = collection(firestore, "users");
export const ADMIN_COLLECTION = collection(firestore, "admin");
export const NOTIFICATIONS_COLLECTION =
  process.env.NODE_ENV === "production"
    ? collection(firestore, "notifications")
    : collection(
        firestore,
        "dev",
        String(process.env.NEXT_PUBLIC_DEV!) + chain.id,
        "notifications"
      );
export const CLAIM_HISTORY_COLLECTION =
  process.env.NODE_ENV === "production"
    ? collection(firestore, "claimHistory")
    : collection(
        firestore,
        "dev",
        String(process.env.NEXT_PUBLIC_DEV!) + chain.id,
        "claimHistory"
      );
export const CONTENTS_COLLECTION =
  process.env.NODE_ENV === "production"
    ? collection(firestore, "contents")
    : collection(
        firestore,
        "dev",
        String(process.env.NEXT_PUBLIC_DEV!) + chain.id,
        "contents"
      );
export const EXPT_LISTINGS_COLLECTION =
  process.env.NODE_ENV === "production"
    ? collection(firestore, "exptListings")
    : collection(
        firestore,
        "dev",
        String(process.env.NEXT_PUBLIC_DEV!) + chain.id,
        "exptListings"
      );
export const BOOKINGS_COLLECTION =
  process.env.NODE_ENV === "production"
    ? collection(firestore, "bookings")
    : collection(
        firestore,
        "dev",
        String(process.env.NEXT_PUBLIC_DEV!) + chain.id,
        "bookings"
      );

export const EXPT_LEVEL_KEYS = [1, 2, 3];
