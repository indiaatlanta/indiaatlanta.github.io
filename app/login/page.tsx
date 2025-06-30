"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Submitting login form for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok && data.success) {
        console.log("Login successful, redirecting to dashboard")
        // Use the redirect URL from the response or default to dashboard
        const redirectUrl = data.redirectUrl || "/dashboard"
        window.location.href = redirectUrl
      } else {
        console.log("Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    console.log("Demo login attempt for:", demoEmail)
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        credentials: "include",
      })

      console.log("Demo login response status:", response.status)
      const data = await response.json()
      console.log("Demo login response data:", data)

      if (response.ok && data.success) {
        console.log("Demo login successful, redirecting to dashboard")
        const redirectUrl = data.redirectUrl || "/dashboard"
        window.location.href = redirectUrl
      } else {
        console.log("Demo login failed:", data.error)
        setError(data.error || "Demo login failed")
      }
    } catch (error) {
      console.error("Demo login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/henry-schein-one-logo.png"
              alt="Henry Schein One"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access the HS1 Careers Matrix</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
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

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3 text-center">Demo Accounts:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-transparent"
                onClick={() => handleDemoLogin("admin@henryscheinone.com", "admin123")}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Admin User</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-transparent"
                onClick={() => handleDemoLogin("user@henryscheinone.com", "user123")}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between w-full">
                  <span>John Doe</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">User</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start bg-transparent"
                onClick={() => handleDemoLogin("manager@henryscheinone.com", "manager123")}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Jane Manager</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Manager</span>
                </div>
              </Button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">Additional demo accounts:</p>
              <p className="text-xs text-gray-400">john.smith@henryscheinone.com / password123</p>
              <p className="text-xs text-gray-400">jane.doe@henryscheinone.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
