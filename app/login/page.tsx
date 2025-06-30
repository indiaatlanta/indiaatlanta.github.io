"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, User, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/skills")
      const data = await response.json()
      setIsDemoMode(data.isDemoMode)
    } catch (error) {
      setIsDemoMode(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (userType: "admin" | "user") => {
    const demoCredentials = {
      admin: { email: "admin@demo.com", password: "admin123" },
      user: { email: "user@demo.com", password: "user123" },
    }

    const creds = demoCredentials[userType]
    setEmail(creds.email)
    setPassword(creds.password)

    // Auto-submit the form
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/")
      } else {
        setError(data.error || "Demo login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img src="/images/hs1-logo.png" alt="Henry Schein One" className="mx-auto h-12 w-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Career Development Matrix</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your career development tools</p>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> Database not configured. Use demo credentials below.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the career matrix</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Credentials */}
            {isDemoMode && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Demo Accounts:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start bg-transparent"
                    onClick={() => handleDemoLogin("admin")}
                    disabled={loading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Admin Demo (admin@demo.com)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start bg-transparent"
                    onClick={() => handleDemoLogin("user")}
                    disabled={loading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    User Demo (user@demo.com)
                  </Button>
                </div>
              </div>
            )}

            {!isDemoMode && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Demo credentials: admin@demo.com / admin123 or user@demo.com / user123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
