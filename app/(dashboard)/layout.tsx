"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/auth"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="center-content">
        <div>Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
