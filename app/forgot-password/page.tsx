"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertTriangle, Copy } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resetLink, setResetLink] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")
    setResetLink("")

    console.log("[FORGOT PASSWORD UI] Starting password reset request...")

    try {
      console.log(`[FORGOT PASSWORD UI] Sending request for email: ${email}`)

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log(`[FORGOT PASSWORD UI] Response status: ${response.status}`)

      const data = await response.json()
      console.log("[FORGOT PASSWORD UI] Response data:", data)

      if (response.ok) {
        setMessage(data.message)
        setEmail("")
        console.log("[FORGOT PASSWORD UI] Success - message set")

        // Extract reset link from console logs for demo purposes
        // In a real app, this would be sent via email
        if (data.resetLink) {
          setResetLink(data.resetLink)
        }
      } else {
        setError(data.error || "An error occurred. Please try again.")
        console.error("[FORGOT PASSWORD UI] Error response:", data)
      }
    } catch (error) {
      console.error("[FORGOT PASSWORD UI] Network/fetch error:", error)
      setError("Network error occurred. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
      console.log("[FORGOT PASSWORD UI] Request completed")
    }
  }

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink)
    alert("Reset link copied to clipboard!")
  }

  const testResetLink = () => {
    // Generate a test reset link for demo purposes
    const testToken = `demo-token-${Date.now()}`
    const testLink = `${window.location.origin}/reset-password?token=${testToken}`
    setResetLink(testLink)
    setMessage("Test reset link generated! Click the link below to test the reset password page.")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={48} height={48} className="h-12 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {/* Reset Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Forgot Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {error}
                    <br />
                    <small className="text-xs mt-1 block">
                      Make sure your development server is running on localhost:3000
                    </small>
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                    {resetLink && (
                      <div className="mt-3 space-y-2">
                        <div className="bg-white p-3 rounded border text-sm font-mono break-all">{resetLink}</div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={copyResetLink}
                            className="flex items-center gap-1 bg-transparent"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Link
                          </Button>
                          <Link href={resetLink}>
                            <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                              Test Reset Page
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-4">
              <Button type="button" variant="outline" onClick={testResetLink} className="w-full bg-transparent">
                🧪 Generate Test Reset Link
              </Button>
            </div>

            <div className="mt-6 text-center space-y-2">
              <Link
                href="/login"
                className="text-brand-600 hover:text-brand-700 text-sm flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
              <div className="text-gray-500 text-sm">Don't have an account? Contact your administrator.</div>
            </div>
          </CardContent>
        </Card>

        {/* Server Status Check */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">🔧 Server Status</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                ✅ Make sure your dev server is running: <code className="bg-blue-100 px-1 rounded">npm run dev</code>
              </p>
              <p>
                🌐 Server should be accessible at: <code className="bg-blue-100 px-1 rounded">localhost:3000</code>
              </p>
              <p>🧪 Use the "Generate Test Reset Link" button to test without email</p>
              <p className="text-xs mt-2 text-blue-600">
                The reset link will only work when your Next.js server is running.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Emails */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-yellow-900 mb-2">🧪 Test Emails</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>
                <strong>Existing user:</strong> admin@henryscheinone.com
              </p>
              <p>
                <strong>Any email:</strong> Will work in demo mode
              </p>
              <p className="text-xs mt-2 text-yellow-600">Try these emails to test the password reset functionality.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
