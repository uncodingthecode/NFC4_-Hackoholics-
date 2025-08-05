"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("john@example.com")
  const [password, setPassword] = useState("password")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useHealthcare()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your healthcare dashboard.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-teal-100 rounded-full">
            <Heart className="h-8 w-8 text-teal-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">Sign in to your healthcare dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">Demo credentials: john@example.com / password</div>
      </CardContent>
    </Card>
  )
}
