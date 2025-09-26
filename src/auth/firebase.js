// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZFRbBVcB2B2gKyJczO-oCqtkbBqlMClU",
  authDomain: "crash-or-cash-ec6ce.firebaseapp.com",
  projectId: "crash-or-cash-ec6ce",
  storageBucket: "crash-or-cash-ec6ce.appspot.com",
  messagingSenderId: "173072514170",
  appId: "1:173072514170:web:cf01f3470847700ead8fc3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
