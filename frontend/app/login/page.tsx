"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHealthcare } from "@/context/healthcare-context"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2, Eye, EyeOff, ArrowLeft, Sparkles, Zap, Shield, Users } from "lucide-react"
import  apiClient  from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { login } = useHealthcare()
  const { toast } = useToast()
  const router = useRouter()

  // Trigger animations after component mounts
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Generate deterministic particle positions
  const generateParticlePositions = () => {
    const positions = []
    for (let i = 0; i < 30; i++) {
      const left = ((i * 8.7) % 100) + (i % 15) * 0.4
      const top = ((i * 12.3) % 100) + (i % 12) * 0.5
      const delay = (i * 0.4) % 4
      const duration = 2.5 + (i % 4) + (i * 0.15) % 1.5
      
      positions.push({
        left: Math.min(left, 95),
        top: Math.min(top, 95),
        delay: delay.toFixed(2),
        duration: duration.toFixed(2)
      })
    }
    return positions
  }

  const particlePositions = generateParticlePositions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Use the API client for login
      const response = await apiClient.login(email, password)

      if (!response.success) {
        throw new Error(response.error || "Login failed")
      }

      // Store tokens and user data
      const { accessToken, refreshToken, user } = response.data as {
        accessToken: string
        refreshToken: string
        user: any
      }
      
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))

      // Update context
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
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {particlePositions.map((pos, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
              animationDuration: `${pos.duration}s`
            }}
          >
            <div className="w-1 h-1 bg-teal-400/30 rounded-full" />
          </div>
        ))}
        
        {/* Animated circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back to Home */}
        <div className={`text-center transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <Link href="/" className="inline-flex items-center text-teal-700 hover:text-teal-800 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className={`text-center space-y-2 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-lg animate-pulse">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your family's health</p>
        </div>

        {/* Login Form */}
        <Card className={`bg-white/90 backdrop-blur-sm border-teal-200 shadow-2xl transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="bg-white border-teal-200 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300 group-hover:border-teal-300"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Sparkles className="h-4 w-4 text-teal-400 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-white border-teal-200 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300 group-hover:border-teal-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-teal-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-teal-300 text-teal-500 focus:ring-teal-500 bg-white"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2.5 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Create one here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-700 font-medium mb-1 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Demo Credentials:
              </p>
              <p className="text-xs text-gray-600">Email: john@example.com</p>
              <p className="text-xs text-gray-600">Password: password</p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Heart className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="absolute top-1/3 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Users className="h-4 w-4 text-teal-400" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Shield className="h-4 w-4 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
