"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./SignupForm.module.css"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password })
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">Sign up for an Account</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
        <Button type="submit">Sign Up</Button>
      </form>
      <p className={styles.footerText}>
        <Link href="/login" className={styles.footerLink}>
          Already have an account? Login
        </Link>
      </p>
    </div>
  )
}
