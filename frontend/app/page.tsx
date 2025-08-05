"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Users, Activity, ArrowRight, Sparkles, Zap, Star, CheckCircle, TrendingUp, Clock } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  // Trigger animations after component mounts
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  // Generate deterministic particle positions
  const generateParticlePositions = () => {
    const positions = []
    for (let i = 0; i < 50; i++) {
      // Use deterministic values based on index
      const left = ((i * 7.3) % 100) + (i % 20) * 0.5
      const top = ((i * 11.7) % 100) + (i % 15) * 0.3
      const delay = (i * 0.3) % 3
      const duration = 2 + (i % 3) + (i * 0.1) % 1
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 overflow-hidden relative">
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
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 lg:p-8">
          <div className={`flex items-center space-x-2 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              HealthCare
            </span>
          </div>
          
          <div className={`flex space-x-4 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <Button
              variant="ghost"
              className="text-teal-700 hover:bg-teal-100 border border-teal-200"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg"
              onClick={() => router.push('/register')}
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Heading */}
            <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 mb-6">
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Revolutionizing
                </span>
                <br />
                <span className="text-gray-800">Family Healthcare</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the future of healthcare management with AI-powered insights, 
                real-time monitoring, and seamless family coordination.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-4 text-lg font-semibold group shadow-lg"
                onClick={() => router.push('/register')}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-teal-300 text-teal-700 hover:bg-teal-50 px-8 py-4 text-lg font-semibold"
                onClick={() => router.push('/login')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </div>

            {/* Features Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">Get intelligent health recommendations and predictive analytics powered by advanced AI.</p>
              </div>

              <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Family Coordination</h3>
                <p className="text-gray-600">Manage your entire family's health in one place with seamless coordination.</p>
              </div>

              <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your health data is protected with enterprise-grade security and privacy.</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-teal-200">
                <div className="text-3xl font-bold text-teal-600 mb-2">10K+</div>
                <div className="text-gray-600">Families Trust Us</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-teal-200">
                <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-teal-200">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">AI Support</div>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-teal-200">
                <div className="text-3xl font-bold text-teal-600 mb-2">50K+</div>
                <div className="text-gray-600">Health Records</div>
              </div>
            </div>

            {/* Additional Features */}
            <div className={`mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white/80 p-6 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Real-time Monitoring</h3>
                </div>
                <p className="text-gray-600">Track vital signs, medication adherence, and health trends in real-time with intelligent alerts.</p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-teal-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Health Analytics</h3>
                </div>
                <p className="text-gray-600">Advanced analytics and insights to help you make informed health decisions for your family.</p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Smart Reminders</h3>
                </div>
                <p className="text-gray-600">Never miss a medication dose or appointment with intelligent reminder systems.</p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Family Health</h3>
                </div>
                <p className="text-gray-600">Comprehensive family health management with role-based access and coordination.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Star className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="absolute top-1/3 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Star className="h-4 w-4 text-teal-400" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}>
            <Star className="h-4 w-4 text-green-400" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 animate-bounce" style={{ animationDelay: '2s' }}>
            <Star className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 p-8 bg-white/60 border-t border-teal-200">
          <div className="text-center">
            <p className="text-gray-600 mb-2">© 2024 HealthCare. All rights reserved.</p>
            <p className="text-sm text-gray-500">Empowering families with intelligent healthcare management</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

