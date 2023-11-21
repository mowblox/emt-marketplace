/**
 * This file is used to configure the authentication provider for the app.
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { FirebaseError } from 'firebase/app';
import { getSession } from "next-auth/react";
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

/**
 * Retrieves the Firebase token for the given address.
 * @param address - The user's address.
 * @returns The Firebase token or null if an error occurs.
 */
async function getFirebaseToken(address: string) {
  function getApp() {
      let app;
      try {
          app = admin.initializeApp(
              {
                  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
              },
              'my-app',
          );
      } catch (error) {
          app = admin.app('my-app');
      }
      return app;
  }

  const auth = getApp().auth();
          
  try {
      const user = await auth.getUser(address).catch(
          async e => await auth.createUser({ uid: address })
      )
      const token = await auth.createCustomToken(address, {});
      return token;
  } catch (error) {
      if (error instanceof FirebaseError) return null;
  }
}

/**
 * The authentication options for NextAuth.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result = await siwe.verify({ 
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (result.success) {
              return {
                id: siwe.address,
              };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      const firebaseToken = await getFirebaseToken(session.address);
      session.user.name = token.sub;
      session.firebaseToken = firebaseToken;
      return session;
    },
  },
};