import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCksvdLhOO570j7_6lv1hs3YHaHZDaUH3k",
  authDomain: "pocket-heist-ah.firebaseapp.com",
  projectId: "pocket-heist-ah",
  storageBucket: "pocket-heist-ah.firebasestorage.app",
  messagingSenderId: "841949895814",
  appId: "1:841949895814:web:83efc656f09540cb030507"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
