/**
 * This file is used to configure the authentication provider for the app.
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { FirebaseError } from "firebase/app";
import { getSession } from "next-auth/react";
import * as admin from "firebase-admin";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { SignUpData } from "@/lib/types";
import { getFirestore, initializeFirestore } from "firebase-admin/firestore";

const USERS_COLLECTION = "users";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

function getApp() {
  let app;
  try {
    app = admin.initializeApp(
      {
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      },
      "my-app"
    );
  } catch (error) {
    app = admin.app("my-app");
  }
  return app;
}
const app = getApp();
const auth = app.auth();
const firestore = initializeFirestore(app);
/**
 * Retrieves the Firebase token for the given address.
 * @param address - The user's address.
 * @returns The Firebase token or null if an error occurs.
 */
async function getFirebaseToken(address: string) {
  try {
    const token = await auth.createCustomToken(address, {});
    console.log("first try");
    return { token };
  } catch (error) {
    return { error };
  }
}

async function isUsernameTaken(username: string) {
  console.log("isUsernameTaken function", username)
  try {
    const result = await firestore
      .collection("users").where("username", "==", username).limit(1)
      .get();
    console.log("isUsernameTaken", result)
    return result.size === 1;
  }catch(error){
    console.log("isUsernameTakenError", error)
    return false
  }
}
async function isEmailTaken(email: string) {
  console.log("isEmailTaken", email)
  try {
    const result = await auth.getUserByEmail(email);
    return true;
  } catch (error) {
    console.log("isEmailTakenError", error)
    return false;
  }
}

async function validateSignUp(signUpData: SignUpData): Promise<Record<string, boolean>> {
  console.log("validateSignUp function")
  return {
    username: !(await isUsernameTaken(signUpData.username!)),
    email: !(await isEmailTaken(signUpData.email!))
  };
}

async function signUp(address: string, signUpData: SignUpData) {
  try {
    const validationResult = await validateSignUp(signUpData);
    for (const key in validationResult) {
      if (!validationResult[key] ) {
        return { error: { code: `validation error`, validationResult} };
      }
    }
    await auth.createUser({ uid: address, ...signUpData });
    signUpData.usernameLowercase = signUpData.username!.toLowerCase();

    const newUserDoc = await firestore
      .collection(USERS_COLLECTION)
      .doc(address)
      .set(signUpData);
    console.log("sign up data  saved", newUserDoc);
    const token = await auth.createCustomToken(address, {});
    return { success: true, token };
  } catch (error: any) {
    return { error };
  }
}

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
          const id = siwe.address;
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (result.success) {
            console.log( "result", result);

            return {
              id,
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
    jwt: async ({
      token,
      user,
      session,
      trigger,
    }: {
      token: any;
      user: any;
      session?: {
        signUpData?: Partial<SignUpData>;
        updates?: Partial<SignUpData>;
        validateSignUpData?: Partial<SignUpData>;
      };
      trigger?: any;
    }) => {
      console.log(
        "JWT CALLBACK",
        "token",
        !!token.firebaseToken,
        "firebaseToken",
        !!user?.firebaseToken,
        "trigger",
        trigger,
      );

      async function isSignedUp(uid: string) {
        try {
          await auth.getUser(uid);
          return true;
        } catch (error) {
          console.log("isSignedUpcheckerror", error);
          return false;
        }
      }
      if (trigger === "signIn" || trigger === "signUp") {
        console.log("SIGN IN CALLBACK", trigger);
        if (!(await isSignedUp(token.sub))) {
          token.isNotSignedUp = true;
          return token;
        }
        const tokenResult = await getFirebaseToken(token.sub);
        if (tokenResult.token) token.firebaseToken = tokenResult.token;
        if (tokenResult.error) token.error = tokenResult.error;
        return token;
      } else if (trigger === "update" && session) {
        console.log("UPDATE CALLBACK", trigger, session);

        if(session.validateSignUpData){
          console.log('validating signup')
          const result = await validateSignUp(session.validateSignUpData);
          console.log(result)
          token.validateSignUpResult = result
          return token
        }

        if (session.signUpData) {
          const signUpResult = await signUp(token.sub, session.signUpData);
          if (signUpResult.success) {
            token.isNewUser = true;
            token.isNotSignedUp = false;
            token.firebaseToken = signUpResult.token;
          }
          if (signUpResult.error) {
            token.error = signUpResult.error;
          }
        } else if (session.updates) {
          auth.updateUser(token.sub, session.updates);
          const updated = await firestore
            .collection(USERS_COLLECTION)
            .doc(token.sub)
            .update(session);
          console.log("UPDATEDfire", updated);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      session = { session, ...token };
      // session.firebaseToken = token.firebaseToken;
      // session.error = token.error;
      // session.isNewUser = token.isNewUser;
      console.log("SESSION CALLBACK");
      return session;
    },
  },
};
