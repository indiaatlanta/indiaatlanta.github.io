import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Users,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  Award,
  Target,
  Clock,
} from "lucide-react"
import { AdminButton } from "@/components/admin-button"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to HS1 Careers Matrix</h2>
            <p className="mt-2 text-sm text-gray-600">Please sign in to continue</p>
          </div>
          <div className="mt-8 space-y-6">
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-auto" src="/images/hs1-logo.png" alt="Henry Schein One" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-sm text-gray-500">Skills Development & Career Planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
              <AdminButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">
            Track your skills development, complete assessments, and plan your career growth.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/self-review">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Self Assessment</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Start</div>
                <p className="text-xs text-muted-foreground">Evaluate your skills</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compare">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compare Roles</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Analyze</div>
                <p className="text-xs text-muted-foreground">Compare job requirements</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assessments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Assessments</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View</div>
                <p className="text-xs text-muted-foreground">Track your progress</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/one-on-ones">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">One-on-Ones</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">Track meetings & goals</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Development */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skills Development
              </CardTitle>
              <CardDescription>Assess and improve your professional skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Link href="/self-review">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Complete Self-Assessment
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare Job Roles
                  </Button>
                </Link>
                <Link href="/assessments">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Award className="h-4 w-4 mr-2" />
                    View Assessment History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* One-on-One Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                One-on-One Meetings
              </CardTitle>
              <CardDescription>Track meetings, action items, and career discussions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Link href="/one-on-ones">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Meetings
                  </Button>
                </Link>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Action Items
                  </span>
                  <Badge variant="secondary">Track Progress</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussion Notes
                  </span>
                  <Badge variant="secondary">Timestamped</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Skills Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Skills Matrix
              </CardTitle>
              <CardDescription>Explore skills requirements by department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/department/engineering">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Engineering
                  </Button>
                </Link>
                <Link href="/department/product">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Product
                  </Button>
                </Link>
                <Link href="/department/design">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Design
                  </Button>
                </Link>
                <Link href="/department/marketing">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Marketing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Career Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Planning
              </CardTitle>
              <CardDescription>Plan your career path and skill development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skill Gap Analysis</span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Learning Recommendations</span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Career Path Mapping</span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest assessments and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Complete an assessment to see your activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
