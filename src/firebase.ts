// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// ✅ Include databaseURL for Realtime DB
const firebaseConfig = {
  apiKey: "AIzaSyCSE8WFB4UzjAzcUgXJkcf0bIIbcbiNOvU",
  authDomain: "osyanpark-66bd5.firebaseapp.com",
  projectId: "osyanpark-66bd5",
  messagingSenderId: "762648517914",
  appId: "1:762648517914:web:dcafc4d0cab2b09cdaa0a3",
  databaseURL: "https://osyanpark-66bd5-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);      // restore original name
export const realtimeDb = getDatabase(app);
