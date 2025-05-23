
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add your own Firebase configuration object here
// Get this from your Firebase project settings:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- REPLACE THIS WITH YOUR ACTUAL API KEY
  authDomain: "YOUR_AUTH_DOMAIN", // <--- REPLACE THIS
  projectId: "YOUR_PROJECT_ID", // <--- REPLACE THIS
  storageBucket: "YOUR_STORAGE_BUCKET", // <--- REPLACE THIS
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- REPLACE THIS
  appId: "YOUR_APP_ID", // <--- REPLACE THIS
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
