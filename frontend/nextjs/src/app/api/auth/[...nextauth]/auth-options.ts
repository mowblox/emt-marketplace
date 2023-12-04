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
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { cert } from "firebase-admin/app";
import { SignUpData } from "@/lib/types";
import { getFirestore, initializeFirestore } from "firebase-admin/firestore";

const USERS_COLLECTION =  'users' 

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

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
const app = getApp();
const auth = app.auth();
const firestore = initializeFirestore(app)
/**
 * Retrieves the Firebase token for the given address.
 * @param address - The user's address.
 * @returns The Firebase token or null if an error occurs.
 */
async function getFirebaseToken(address: string, signUpData: SignUpData = {}) {
  let wasAlreadySignedUp = false;
  try {
    const user = await auth.getUser(address)
    const token = await auth.createCustomToken(address, {});
    console.log('first try')
    return { token, wasAlreadySignedUp: true };
  } catch (error: any) {
    console.log('error', error.code)
    if (error.code !== 'auth/user-not-found') return { error };
    console.log('second try', signUpData)
    if (signUpData?.username) {
      console.log("sign up data to be saved")
      await auth.createUser({ uid: address, ...signUpData })
      const newUserDoc = await firestore.collection(USERS_COLLECTION).doc(address).set(signUpData)
      console.log("sign up data  saved", newUserDoc)
      const token = await auth.createCustomToken(address, {});

      return { token, isNewUser: true };
    }
    else {
      console.log('is not signed up')
      return { isNotSignedUp: true }
    }


  }
}

// const firestore = initFirestore({
//   credential: cert(serviceAccount),
// })

/**
 * The authentication options for NextAuth.
 */
export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(firestore),
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
          const id = siwe.address
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (result.success) {
            console.log("siwe", siwe, "result", result)
            const signUpData: SignUpData = siwe.resources ? JSON.parse(siwe.resources[0]) : null
            const tokenResult = await getFirebaseToken(siwe.address, signUpData);
            console.log('sdata', signUpData, 'tres', tokenResult)

            if (!tokenResult || tokenResult?.error) {
              throw new Error(tokenResult?.error)
            }
            if(tokenResult?.isNotSignedUp){
                return {id, isNotSignedUp: true}
            }
            return {
              id,
              isNewUser: tokenResult.isNewUser,
              firebaseToken: tokenResult.token,
              isMultipleSignUpAttempt: !!(signUpData && tokenResult?.wasAlreadySignedUp)
            };


          }
          console.log("result", result);
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
    jwt: async ({ token, user, session, trigger }: { token: any, user: any, session?: Partial<SignUpData> & { resetMultipleSignUpAttempt: boolean }, trigger?: any }) => {
      console.log("JWT CALLBACK", 'token', !!token.firebaseToken, 'firebaseToken', !!user?.firebaseToken, 'trigger', trigger, "session", session)
      
      if (trigger === "signIn" || trigger === "signUp") {
        console.log("SIGN IN CALLBACK", trigger)
        token.firebaseToken = user.firebaseToken;
        token.isMultipleSignUpAttempt = user.isMultipleSignUpAttempt;
        token.isNotSignedUp = user.isNotSignedUp;
        token.isNewUser = user.isNewUser;
        return token;
      }
      else if (trigger === "update" && session) {
        console.log("UPDATE CALLBACK", trigger, session)
        if (session.resetMultipleSignUpAttempt) {
          token.isMultipleSignUpAttempt = false;
          return token
        }
        auth.updateUser(token.sub, session);
        const updated = await firestore.collection(USERS_COLLECTION).doc(token.sub).update(session);
        console.log("UPDATEDfire", updated);
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.address = token.sub;
      session.firebaseToken = token.firebaseToken;
      session.isMultipleSignUpAttempt = token.isMultipleSignUpAttempt;
      session.isNotSignedUp = token.isNotSignedUp;
      session.isNewUser = token.isNewUser;
      console.log("SESSION CALLBACK", "fbt?", !!session?.firebaseToken, "isMultipleSignUpAttempt", session?.isMultipleSignUpAttempt, 'notSignedUp?', session?.isNotSignedUp)
      return session;
    },

    async redirect({url, baseUrl}){
      console.log("REDIRECT CALLBACK", url, baseUrl)
      return baseUrl
    }
  },
};