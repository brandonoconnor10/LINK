import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVdA9VA_ezvTF2djyk7PsOB0A6xxQ-Fjs",
  authDomain: "linksaver10.firebaseapp.com",
  projectId: "linksaver10",
  storageBucket: "linksaver10.firebasestorage.app",
  messagingSenderId: "665322933040",
  appId: "1:665322933040:web:a57dccc1d1bbc4cc0996f5",
  measurementId: "G-LLZ3HZ6598"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
