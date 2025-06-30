"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting login form for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Login response:", { status: response.status, data })

      if (response.ok && data.success) {
        console.log("Login successful, redirecting to home page")
        // Force a hard redirect to ensure session is recognized
        window.location.href = "/"
      } else {
        console.log("Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsLoading(true)
    setError("")

    try {
      console.log("Demo login for:", demoEmail)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      })

      const data = await response.json()
      console.log("Demo login response:", { status: response.status, data })

      if (response.ok && data.success) {
        console.log("Demo login successful, redirecting to home page")
        window.location.href = "/"
      } else {
        console.log("Demo login failed:", data.error)
        setError(data.error || "Demo login failed")
      }
    } catch (error) {
      console.error("Demo login error:", error)
      setError("An error occurred during demo login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img src="/images/hs1-logo.png" alt="Henry Schein One" className="mx-auto h-12 w-auto" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Career Development Matrix</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your career development tools</p>
        </div>

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
                    placeholder="user@henryscheinone.com"
                    className="pl-10"
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
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">Click to login with demo credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin@henryscheinone.com", "admin123")}
                disabled={isLoading}
                className="justify-start text-xs"
              >
                <User className="mr-2 h-3 w-3" />
                Admin: admin@henryscheinone.com / admin123
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("user@henryscheinone.com", "user123")}
                disabled={isLoading}
                className="justify-start text-xs"
              >
                <User className="mr-2 h-3 w-3" />
                User: user@henryscheinone.com / user123
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("manager@henryscheinone.com", "manager123")}
                disabled={isLoading}
                className="justify-start text-xs"
              >
                <User className="mr-2 h-3 w-3" />
                Manager: manager@henryscheinone.com / manager123
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Demo Credentials */}
        <div className="text-center text-xs text-gray-500">
          <p>Additional demo credentials:</p>
          <p>john.smith@henryscheinone.com / password123</p>
          <p>jane.doe@henryscheinone.com / password123</p>
        </div>
      </div>
    </div>
  )
}
