// เริ่มต้น Firebase เฉพาะเมื่อมี config ครบใน .env
// หากไม่มี แอปจะทำงานใน "โหมดเดโม" (เก็บข้อมูลใน localStorage)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket);

let db = null;
let storage = null;

if (isFirebaseEnabled) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { db, storage };
