"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2, Eye, EyeOff, ArrowLeft, UserPlus, Sparkles, Zap, Shield, Users, CheckCircle, Star } from "lucide-react"
import { apiClient } from "@/lib/api"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "head"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Trigger animations after component mounts
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Generate deterministic particle positions
  const generateParticlePositions = () => {
    const positions = []
    for (let i = 0; i < 35; i++) {
      const left = ((i * 9.2) % 100) + (i % 18) * 0.3
      const top = ((i * 13.7) % 100) + (i % 14) * 0.6
      const delay = (i * 0.35) % 4.5
      const duration = 2.8 + (i % 4) + (i * 0.12) % 1.8
      
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Minimum 6 characters required.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        // For head role, we don't need familyId initially
        // For member role, familyId would be required but we'll handle that later
      }

      const response = await apiClient.register(payload)

      if (!response.success) {
        throw new Error(response.error || "Registration failed")
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to HealthCare. Please sign in to continue.",
      })

      // Redirect to login page
      router.push("/login")

    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              <UserPlus className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Join HealthCare</h1>
          <p className="text-gray-600">Create your account to start managing family health</p>
        </div>

        {/* Registration Form */}
        <Card className={`bg-white/90 backdrop-blur-sm border-teal-200 shadow-2xl transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="bg-white border-teal-200 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300 group-hover:border-teal-300"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Users className="h-4 w-4 text-teal-400 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
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
                <Label htmlFor="role" className="text-gray-700">Role</Label>
                <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                  <SelectTrigger className="bg-white border-teal-200 text-gray-800 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300 hover:border-teal-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-teal-200">
                    <SelectItem value="head" className="text-gray-800 hover:bg-teal-50">Family Head</SelectItem>
                    <SelectItem value="member" className="text-gray-800 hover:bg-teal-50">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="bg-white border-teal-200 text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300 group-hover:border-teal-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-teal-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2.5 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Role Information */}
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-700 font-medium mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Role Information:
              </p>
              <p className="text-xs text-gray-600 mb-1">• <strong>Family Head:</strong> Create and manage your family group</p>
              <p className="text-xs text-gray-600">• <strong>Family Member:</strong> Join an existing family group</p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Star className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="absolute top-1/3 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Heart className="h-4 w-4 text-teal-400" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Shield className="h-4 w-4 text-green-400" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 animate-bounce" style={{ animationDelay: '2s' }}>
            <UserPlus className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
