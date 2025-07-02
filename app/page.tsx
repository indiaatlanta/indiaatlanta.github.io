import { getCurrentUser } from "@/lib/auth"
import { sql, isDatabaseConfigured } from "@/lib/db"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  Target,
  TrendingUp,
  FileText,
  UserCheck,
  GitCompare,
  BookOpen,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getDashboardStats() {
  if (!isDatabaseConfigured() || !sql) {
    return {
      totalUsers: 0,
      totalDepartments: 0,
      totalSkills: 0,
      totalAssessments: 0,
      isDemoMode: true,
    }
  }

  try {
    const [users, departments, skills, assessments] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM departments`,
      sql`SELECT COUNT(*) as count FROM skills_master`,
      sql`SELECT COUNT(*) as count FROM saved_assessments`,
    ])

    return {
      totalUsers: Number.parseInt(users[0]?.count || "0"),
      totalDepartments: Number.parseInt(departments[0]?.count || "0"),
      totalSkills: Number.parseInt(skills[0]?.count || "0"),
      totalAssessments: Number.parseInt(assessments[0]?.count || "0"),
      isDemoMode: false,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return {
      totalUsers: 0,
      totalDepartments: 0,
      totalSkills: 0,
      totalAssessments: 0,
      isDemoMode: true,
    }
  }
}

async function getRecentDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return []
  }

  try {
    const departments = await sql`
      SELECT 
        name,
        slug,
        description,
        created_at,
        (SELECT COUNT(*) FROM job_roles WHERE department_id = departments.id) as role_count
      FROM departments 
      ORDER BY created_at DESC 
      LIMIT 6
    `
    return Array.isArray(departments) ? departments : []
  } catch (error) {
    console.error("Failed to fetch recent departments:", error)
    return []
  }
}

async function getRecentAssessments(userId: number) {
  if (!isDatabaseConfigured() || !sql) {
    return []
  }

  try {
    // Ensure table exists first
    await sql`
      CREATE TABLE IF NOT EXISTS saved_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        job_role_name VARCHAR(255) NOT NULL,
        department_name VARCHAR(255) NOT NULL,
        skills_data JSONB NOT NULL,
        overall_score DECIMAL(5,2) DEFAULT 0,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const assessments = await sql`
      SELECT 
        name,
        job_role_name,
        department_name,
        overall_score,
        completion_percentage,
        created_at
      FROM saved_assessments 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT 3
    `
    return Array.isArray(assessments) ? assessments : []
  } catch (error) {
    console.error("Failed to fetch recent assessments:", error)
    return []
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()
  const stats = await getDashboardStats()
  const recentDepartments = await getRecentDepartments()
  const recentAssessments = user ? await getRecentAssessments(user.id) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-sm text-gray-500">Skills Assessment & Career Development</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminButton user={user} />
              <LoginButton user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the HS1 Careers Matrix</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your career path, assess your skills, and unlock your potential within Henry Schein One. Our
            comprehensive platform helps you navigate your professional journey with confidence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
              <p className="text-xs text-muted-foreground">Career pathways available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">Professional competencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">Completed evaluations</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Self Assessment
              </CardTitle>
              <CardDescription>Evaluate your current skills and identify areas for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/self-review">
                  Start Assessment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-green-600" />
                Role Comparison
              </CardTitle>
              <CardDescription>Compare your skills against specific job roles and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/compare">
                  Compare Roles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Saved Assessments
              </CardTitle>
              <CardDescription>View and manage your completed skill assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{recentAssessments.length} saved</Badge>
              </div>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/assessments">
                  View Assessments
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments */}
        {recentAssessments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Assessments</h3>
              <Button asChild variant="ghost">
                <Link href="/assessments">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAssessments.map((assessment, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{assessment.name}</CardTitle>
                    <CardDescription>
                      {assessment.job_role_name} • {assessment.department_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={assessment.completion_percentage >= 100 ? "default" : "secondary"}>
                        {Math.round(assessment.completion_percentage)}% Complete
                      </Badge>
                      <span className="text-sm text-gray-600">Score: {assessment.overall_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Departments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Explore Departments</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {recentDepartments.length} Available
            </Badge>
          </div>

          {recentDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDepartments.map((dept) => (
                <Card key={dept.slug} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                      <Badge variant="outline">
                        {dept.role_count} {dept.role_count === 1 ? "Role" : "Roles"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {dept.description || "Explore career opportunities and skill requirements"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/department/${dept.slug}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Explore
                        </Link>
                      </Button>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(dept.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Departments Available</h4>
                <p className="text-muted-foreground mb-4">
                  Departments will appear here once they are created by administrators.
                </p>
                {user?.role === "admin" && (
                  <Button asChild>
                    <Link href="/admin">Go to Admin Panel</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Demo Mode Notice */}
        {stats.isDemoMode && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <TrendingUp className="h-5 w-5" />
                <p className="font-medium">Demo Mode Active</p>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Database is not configured. Some features may show placeholder data.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
