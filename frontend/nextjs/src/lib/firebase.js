// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "emt-marketplace-6bc77.firebaseapp.com",
  projectId: "emt-marketplace-6bc77",
  storageBucket: "emt-marketplace-6bc77.appspot.com",
  messagingSenderId: "927116640337",
  appId: "1:927116640337:web:231f3fd6dbd1679d11f870",
  measurementId: "G-RX5EYJK6HH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app)
export const storage = getStorage(app)
