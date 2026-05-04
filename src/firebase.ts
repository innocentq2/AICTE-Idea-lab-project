import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATijaSiNcBoj90p7uZ-cYJSFQvnb95IjE",
  authDomain: "aicet-idea-lab.firebaseapp.com",
  projectId: "aicet-idea-lab",
  storageBucket: "aicet-idea-lab.firebasestorage.app",
  messagingSenderId: "144074649600",
  appId: "1:144074649600:web:26c6b9f385ebff67f1e8e5",
  measurementId: "G-141ZPL08F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database
export const db = getFirestore(app);
