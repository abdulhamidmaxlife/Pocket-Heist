"use client"

import { Clock8, Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useUser } from "@/lib/auth"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user, loading } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
          <Link href="/heists">
            P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
            cket Heist
          </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          {user && !loading && (
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn"
                aria-label="Log out of your account"
              >
                <LogOut size={16} strokeWidth={2.5} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          )}
          <li>
            <Link href="/heists/create" className="btn">
              <Plus size={16} strokeWidth={2.5} />
              Create New Heist
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
