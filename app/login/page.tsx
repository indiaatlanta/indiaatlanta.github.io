"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
        // Redirect based on user role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/profile")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (userType: "admin" | "manager" | "user") => {
    const credentials = {
      admin: { email: "admin@henryscheinone.com", password: "admin123" },
      manager: { email: "manager@henryscheinone.com", password: "manager123" },
      user: { email: "user@henryscheinone.com", password: "user123" },
    }

    setEmail(credentials[userType].email)
    setPassword(credentials[userType].password)
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>Click to auto-fill login credentials for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials("admin")}
                className="justify-start"
              >
                <span className="font-medium">Admin:</span>
                <span className="ml-2 text-sm text-gray-600">admin@henryscheinone.com / admin123</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials("manager")}
                className="justify-start"
              >
                <span className="font-medium">Manager:</span>
                <span className="ml-2 text-sm text-gray-600">manager@henryscheinone.com / manager123</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillDemoCredentials("user")} className="justify-start">
                <span className="font-medium">User:</span>
                <span className="ml-2 text-sm text-gray-600">user@henryscheinone.com / user123</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Career Matrix
          </Link>
        </div>
      </div>
    </div>
  )
}
