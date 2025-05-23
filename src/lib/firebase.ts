
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Added Firestore

// PASTE YOUR ACTUAL FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyA2Mpjvz1pv87m19XKgQMXG4hE8kIID3JQ",
  authDomain: "tripledger-2576d.firebaseapp.com",
  projectId: "tripledger-2576d",
  storageBucket: "tripledger-2576d.appspot.com", // Corrected to .appspot.com
  messagingSenderId: "737032442662",
  appId: "1:737032442662:web:37dee1de91eef785d2a7e7"
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

export { app, auth, googleProvider, db }; // Export db
