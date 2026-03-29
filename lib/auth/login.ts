import { signInWithEmailAndPassword, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface LoginResult {
  user: User
  codename: string
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  const userDoc = await getDoc(doc(db, "users", user.uid))

  if (!userDoc.exists()) {
    throw new Error("User profile not found")
  }

  const { codename } = userDoc.data()

  return { user, codename }
}
