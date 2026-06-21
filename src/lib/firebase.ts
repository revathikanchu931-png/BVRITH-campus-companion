import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credentials derived from /firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDZoTuZiS35XkFOzefn7T2R9TJC2CFgrWo",
  authDomain: "gen-lang-client-0999158706.firebaseapp.com",
  projectId: "gen-lang-client-0999158706",
  storageBucket: "gen-lang-client-0999158706.firebasestorage.app",
  messagingSenderId: "270086349134",
  appId: "1:270086349134:web:eb0159dfe2cc439fb83e1f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard custom Firestore database ID
export const db = getFirestore(app, "ai-studio-a762f2dc-9ab0-4386-be10-af0fe05c6eda");
