import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Target, TrendingUp, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import AdminButton from "@/components/admin-button"

const sql = neon(process.env.DATABASE_URL!)

async function getUser() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT u.id, u.name, u.email, u.role 
      FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
      AND s.expires_at > NOW()
    `

    return sessions[0] || null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

async function getRecentAssessments() {
  try {
    const assessments = await sql`
      SELECT 
        assessment_name,
        job_role,
        department,
        overall_score,
        completion_percentage,
        created_at
      FROM saved_assessments 
      ORDER BY created_at DESC 
      LIMIT 3
    `
    return Array.isArray(assessments) ? assessments : []
  } catch (error) {
    console.error("Error getting recent assessments:", error)
    return []
  }
}

export default async function HomePage() {
  const user = await getUser()
  const recentAssessments = await getRecentAssessments()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-8" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-gray-600">Skills assessment and career development platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && <AdminButton user={user} />}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user ? user.name.charAt(0).toUpperCase() : "G"}
                </div>
                <span className="text-sm font-medium">{user ? user.name : "Guest User"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome{user ? `, ${user.name}` : " to HS1 Careers Matrix"}
          </h2>
          <p className="text-lg text-gray-600">
            Assess your skills, explore career paths, and track your professional development journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/self-review">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                  Self Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Evaluate your current skills and identify areas for growth</p>
                <Button size="sm" className="w-full">
                  Start Assessment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/compare">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Compare Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Compare your skills against different job roles</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Compare Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/assessments">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Saved Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">View and manage your completed assessments</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{recentAssessments.length} saved</Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/department/engineering">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                  Explore Careers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">Browse departments and career opportunities</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Explore
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Assessments */}
        {recentAssessments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recent Assessments</h3>
              <Link href="/assessments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAssessments.map((assessment, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{assessment.assessment_name}</CardTitle>
                    <CardDescription>
                      {assessment.job_role} • {assessment.department}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}>
                        {Math.round(assessment.completion_percentage)}% Complete
                      </Badge>
                      <span className="text-sm text-gray-600">Score: {assessment.overall_score.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Track Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitor your skill development over time with detailed assessments and progress tracking.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Comprehensive skill evaluations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Progress visualization and analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Personalized development recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Career Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore career paths and understand the skills needed for your next role.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  Role-specific skill requirements
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  Career pathway recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  Skills gap analysis
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
