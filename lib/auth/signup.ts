import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  User,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/utils/codename"

export interface SignupResult {
  user: User
  codename: string
}

export async function signupUser(
  email: string,
  password: string
): Promise<SignupResult> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  const codename = generateCodename()

  try {
    await updateProfile(user, { displayName: codename })

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      codename: codename,
    })

    return { user, codename }
  } catch (firestoreError) {
    try {
      await deleteUser(user)
    } catch (deleteError) {
      console.error("Failed to cleanup auth user:", deleteError)
    }
    throw firestoreError
  }
}
