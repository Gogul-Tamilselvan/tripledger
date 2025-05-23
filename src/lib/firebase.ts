
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add your own Firebase configuration object here
// Get this from your Firebase project settings:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "AIzaSyA2Mpjvz1pv87m19XKgQMXG4hE8kIID3JQ",
  authDomain: "tripledger-2576d.firebaseapp.com",
  projectId: "tripledger-2576d",
  storageBucket: "tripledger-2576d.appspot.com", // Corrected from .firebasestorage.app based on typical Firebase config
  messagingSenderId: "737032442662",
  appId: "1:737032442662:web:37dee1de91eef785d2a7e7"
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
