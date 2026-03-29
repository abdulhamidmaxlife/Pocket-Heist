"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FirebaseError } from "firebase/app"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { loginUser } from "@/lib/auth"
import styles from "./LoginForm.module.css"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { codename } = await loginUser(email, password)

      setSuccess(`Welcome back, ${codename}!`)
      setEmail("")
      setPassword("")

      setTimeout(() => {
        setSuccess("")
      }, 4000)
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setError("Invalid email or password")
            break
          case "auth/invalid-email":
            setError("Invalid email address")
            break
          case "auth/user-disabled":
            setError("This account has been disabled")
            break
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please try again later.")
            break
          default:
            setError("Failed to log in. Please try again.")
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError("")
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">Log in to Your Account</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          required
          disabled={loading}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          required
          disabled={loading}
          icon={
            <button
              type="button"
              onClick={togglePassword}
              aria-label="Toggle password visibility"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className={styles.footerText}>
        <Link href="/signup" className={styles.footerLink}>
          Don&apos;t have an account? Sign up
        </Link>
      </p>
    </div>
  )
}
