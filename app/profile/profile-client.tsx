"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Calendar, Building, Mail, Eye, Trash2 } from "lucide-react"
import type { User as UserType } from "@/lib/auth"

interface SavedComparison {
  id: number
  name: string
  description: string
  role_names: string[]
  created_at: string
  user_name?: string
  user_email?: string
}

interface SavedSelfReview {
  id: number
  name: string
  description: string
  role_name: string
  created_at: string
  user_name?: string
  user_email?: string
}

interface ProfileClientProps {
  user: UserType
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([])
  const [savedReviews, setSavedReviews] = useState<SavedSelfReview[]>([])
  const [teamComparisons, setTeamComparisons] = useState<SavedComparison[]>([])
  const [teamReviews, setTeamReviews] = useState<SavedSelfReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadUserData()
    if (user.role === "manager" || user.role === "admin") {
      loadTeamData()
    }
  }, [user.role])

  const loadUserData = async () => {
    try {
      // Load saved comparisons
      const comparisonsResponse = await fetch("/api/saved-comparisons")
      const comparisonsData = await comparisonsResponse.json()
      setSavedComparisons(comparisonsData.comparisons || [])
      setIsDemoMode(comparisonsData.isDemoMode)

      // Load saved self reviews
      const reviewsResponse = await fetch("/api/saved-self-reviews")
      const reviewsData = await reviewsResponse.json()
      setSavedReviews(reviewsData.reviews || [])
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeamData = async () => {
    if (user.role !== "manager" && user.role !== "admin") return

    try {
      // For managers, load team data
      // For admins, this could be expanded to show all users
      const comparisonsResponse = await fetch("/api/saved-comparisons")
      const comparisonsData = await comparisonsResponse.json()
      setTeamComparisons(comparisonsData.comparisons?.filter((c: SavedComparison) => c.user_email !== user.email) || [])

      const reviewsResponse = await fetch("/api/saved-self-reviews")
      const reviewsData = await reviewsResponse.json()
      setTeamReviews(reviewsData.reviews?.filter((r: SavedSelfReview) => r.user_email !== user.email) || [])
    } catch (error) {
      console.error("Error loading team data:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Profile data is simulated for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* User Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="w-6 h-6" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">Full Name</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">Role</span>
              </div>
              {user.job_title && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{user.job_title}</p>
                    <p className="text-sm text-gray-600">Job Title</p>
                  </div>
                </div>
              )}
              {user.hire_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{new Date(user.hire_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Hire Date</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="comparisons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="comparisons">My Comparisons</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          {(user.role === "manager" || user.role === "admin") && (
            <>
              <TabsTrigger value="team-comparisons">Team Comparisons</TabsTrigger>
              <TabsTrigger value="team-reviews">Team Reviews</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Role Comparisons</CardTitle>
            </CardHeader>
            <CardContent>
              {savedComparisons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved comparisons yet.</p>
                  <p className="text-sm mt-2">
                    Visit the{" "}
                    <a href="/compare" className="text-brand-600 hover:text-brand-700">
                      Compare Roles
                    </a>{" "}
                    page to create and save comparisons.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedComparisons.map((comparison) => (
                    <div key={comparison.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{comparison.name}</h3>
                          {comparison.description && (
                            <p className="text-sm text-gray-600 mt-1">{comparison.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Roles:</span>
                            {comparison.role_names.map((role, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Saved on {formatDate(comparison.created_at)}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Self Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {savedReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved self reviews yet.</p>
                  <p className="text-sm mt-2">
                    Visit the{" "}
                    <a href="/self-review" className="text-brand-600 hover:text-brand-700">
                      Self Review
                    </a>{" "}
                    page to create and save reviews.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{review.name}</h3>
                          {review.description && <p className="text-sm text-gray-600 mt-1">{review.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Role:</span>
                            <Badge variant="outline" className="text-xs">
                              {review.role_name}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Saved on {formatDate(review.created_at)}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(user.role === "manager" || user.role === "admin") && (
          <>
            <TabsContent value="team-comparisons" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Role Comparisons</CardTitle>
                </CardHeader>
                <CardContent>
                  {teamComparisons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No team comparisons available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamComparisons.map((comparison) => (
                        <div key={comparison.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{comparison.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {comparison.user_name}
                                </Badge>
                              </div>
                              {comparison.description && (
                                <p className="text-sm text-gray-600 mt-1">{comparison.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-500">Roles:</span>
                                {comparison.role_names.map((role, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Saved on {formatDate(comparison.created_at)}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team-reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Self Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {teamReviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No team reviews available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{review.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {review.user_name}
                                </Badge>
                              </div>
                              {review.description && <p className="text-sm text-gray-600 mt-1">{review.description}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-500">Role:</span>
                                <Badge variant="outline" className="text-xs">
                                  {review.role_name}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Saved on {formatDate(review.created_at)}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
