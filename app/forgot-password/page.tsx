"use client"
import { useState } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

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
                      Check the browser console (F12) for detailed error information.
                    </small>
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                    <br />
                    <small className="text-xs mt-1 block">
                      If you don't receive an email, check the browser console (F12) for the reset link.
                    </small>
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
                  disabled={isLoading || !!message}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isLoading || !!message}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

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

        {/* Debug Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">🔧 Debug Information</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>✅ Enhanced error logging enabled</p>
              <p>📧 Email service: {process.env.RESEND_API_KEY ? "Resend configured" : "Console fallback"}</p>
              <p>⏱️ Reset links expire in 1 hour</p>
              <p>🔒 Links can only be used once</p>
              <p className="text-xs mt-2 text-blue-600">
                Open browser console (F12) to see detailed logs and any reset links.
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
