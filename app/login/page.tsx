"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const data = await response.json()

      if (data.success) {
        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else if (data.user.role === "manager") {
          router.push("/team")
        } else {
          router.push("/")
        }
        router.refresh()
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const data = await response.json()

      if (data.success) {
        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else if (data.user.role === "manager") {
          router.push("/team")
        } else {
          router.push("/")
        }
        router.refresh()
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Demo login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={200} height={60} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Access the HS1 Careers Matrix</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <p className="text-sm text-gray-600 text-center mb-4">Demo Accounts (Click to login)</p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleDemoLogin("admin@henryscheinone.com", "admin123")}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Admin User</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleDemoLogin("manager@henryscheinone.com", "manager123")}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Manager User</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Manager</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleDemoLogin("user@henryscheinone.com", "user123")}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Regular User</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">User</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-brand-600 hover:text-brand-500">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
