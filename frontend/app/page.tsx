"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useHealthcare } from "@/context/healthcare-context"
import LoginForm from "@/components/auth/login-form"

export default function HomePage() {
  const { user } = useHealthcare()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
