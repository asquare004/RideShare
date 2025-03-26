import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config object
  apiKey: "AIzaSyCQv10U7BxBeCt0bOQpgax_MD4S-3nzbyI",
  authDomain: "rideshare-5a556.firebaseapp.com",
  projectId: "rideshare-5a556",
  storageBucket: "rideshare-5a556.firebasestorage.app",
  messagingSenderId: "819914391029",
  appId: "1:819914391029:web:5ccb1181a0320e032a34bc"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 