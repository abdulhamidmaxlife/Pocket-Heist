"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import { Eye, EyeOff } from "lucide-react"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { signupUser } from "@/lib/auth"
import styles from "./SignupForm.module.css"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signupUser(email, password)
      router.push("/heists")
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("An account with this email already exists")
            break
          case "auth/weak-password":
            setError("Password should be at least 6 characters")
            break
          case "auth/invalid-email":
            setError("Invalid email address")
            break
          default:
            setError("Failed to create account. Please try again.")
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">Sign up for an Account</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          icon={
            <button
              type="button"
              onClick={togglePassword}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
      <p className={styles.footerText}>
        <Link href="/login" className={styles.footerLink}>
          Already have an account? Login
        </Link>
      </p>
    </div>
  )
}
