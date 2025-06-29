"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

const DEMO_CREDENTIALS = [
  {
    role: "Admin",
    email: "admin@henryscheinone.com",
    password: "admin123",
    description: "Full system access, user management, skills editing",
  },
  {
    role: "Manager",
    email: "manager@henryscheinone.com",
    password: "manager123",
    description: "Team oversight, view team assessments and progress",
  },
  {
    role: "User",
    email: "user@henryscheinone.com",
    password: "user123",
    description: "Personal assessments, role comparisons, skill tracking",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login failed:", errorText)
        setError("Login failed. Please check your credentials.")
        return
      }

      const data = await response.json()

      if (data.success && data.user) {
        // Redirect based on user role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else if (data.user.role === "manager") {
          router.push("/profile")
        } else {
          router.push("/profile")
        }
        router.refresh()
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
              <p className="text-brand-600 text-sm">Sign in to your account</p>
            </div>
          </div>
        </div>

        <Card className="border-brand-200">
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your career development dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@henryscheinone.com"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700">
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {DEMO_CREDENTIALS.map((cred) => (
                  <Button
                    key={cred.role}
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin(cred.email, cred.password)}
                    className="w-full text-left justify-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{cred.role} Demo</div>
                        <div className="text-xs text-gray-500">{cred.description}</div>
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Click to use</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-brand-600 hover:text-brand-700 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
