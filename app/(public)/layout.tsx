"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/lib/auth"
import Footer from "@/components/Footer"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && user && pathname !== "/preview") {
      router.push("/heists")
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <main className="public center-content">
        <div>Loading...</div>
      </main>
    )
  }

  if (user && pathname !== "/preview") {
    return null
  }

  return (
    <main className="public">
      {children}
      <Footer />
    </main>
  )
}
