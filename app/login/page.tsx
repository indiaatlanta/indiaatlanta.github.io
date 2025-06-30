"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we're in demo mode by testing database connectivity
    const checkDemoMode = async () => {
      try {
        const response = await fetch("/api/roles")
        const data = await response.json()
        setIsDemoMode(data.isDemoMode || false)
      } catch (error) {
        console.error("Error checking demo mode:", error)
        setIsDemoMode(true)
      }
    }
    checkDemoMode()
  }, [])

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

      if (response.ok) {
        const data = await response.json()
        console.log("Login successful:", data)
        router.push("/")
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    // Set demo credentials and submit
    setEmail("user@henryscheinone.com")
    setPassword("user123")
    // Trigger form submission programmatically
    setTimeout(() => {
      const form = document.getElementById("login-form") as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={48} height={48} className="h-12 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Career Matrix</h2>
          <p className="mt-2 text-gray-600">Sign in to explore career opportunities</p>
        </div>

        {/* Demo Mode Alert */}
        {isDemoMode && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-medium text-blue-900 mb-2">Demo Mode Active</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Database is not configured. You can access the career matrix with demo credentials.
                </p>
                <Button onClick={handleDemoLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                  Access Career Matrix (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@henryscheinone.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              {!isDemoMode && (
                <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 text-sm">
                  Forgot your password?
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">Demo Credentials</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Admin:</strong> admin@henryscheinone.com / admin123
              </p>
              <p>
                <strong>User:</strong> user@henryscheinone.com / user123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
