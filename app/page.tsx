import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Target, TrendingUp, Plus, Settings, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { LoginButton } from "@/components/login-button"
import { AdminButton } from "@/components/admin-button"
import { sql } from "@vercel/postgres"

interface RecentAssessment {
  id: number
  assessment_name: string
  job_role_name: string
  department_name: string
  overall_score: number
  completion_percentage: number
  created_at: string
}

async function getRecentAssessments(): Promise<RecentAssessment[]> {
  try {
    // Run the schema update first
    await sql`
      ALTER TABLE saved_assessments 
      ADD COLUMN IF NOT EXISTS job_role_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS department_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS skills_data JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_skills INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS completed_skills INTEGER DEFAULT 0
    `

    // Update existing records to populate the new columns from related tables
    await sql`
      UPDATE saved_assessments 
      SET 
          job_role_name = COALESCE(jr.name, 'Unknown Role'),
          department_name = COALESCE(d.name, 'Unknown Department')
      FROM job_roles jr
      JOIN departments d ON jr.department_id = d.id
      WHERE saved_assessments.role_id = jr.id
      AND (saved_assessments.job_role_name IS NULL OR saved_assessments.job_role_name = '')
    `

    // Fetch recent assessments with fallback for missing data
    const { rows } = await sql`
      SELECT 
        sa.id,
        COALESCE(sa.assessment_name, 'Unnamed Assessment') as assessment_name,
        COALESCE(sa.job_role_name, jr.name, 'Unknown Role') as job_role_name,
        COALESCE(sa.department_name, d.name, 'Unknown Department') as department_name,
        COALESCE(sa.overall_score, 0) as overall_score,
        COALESCE(sa.completion_percentage, 0) as completion_percentage,
        sa.created_at
      FROM saved_assessments sa
      LEFT JOIN job_roles jr ON sa.role_id = jr.id
      LEFT JOIN departments d ON jr.department_id = d.id
      ORDER BY sa.created_at DESC 
      LIMIT 5
    `

    return Array.isArray(rows) ? rows : []
  } catch (error) {
    console.error("Failed to fetch recent assessments:", error)
    return []
  }
}

async function getAssessmentStats() {
  try {
    // Ensure columns exist first
    await sql`
      ALTER TABLE saved_assessments 
      ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2) DEFAULT 0
    `

    const { rows } = await sql`
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(CASE WHEN COALESCE(completion_percentage, 0) >= 100 THEN 1 END) as completed_assessments,
        COUNT(CASE WHEN COALESCE(completion_percentage, 0) > 0 AND COALESCE(completion_percentage, 0) < 100 THEN 1 END) as in_progress_assessments,
        COALESCE(AVG(NULLIF(overall_score, 0)), 0) as average_score
      FROM saved_assessments
    `

    const stats =
      Array.isArray(rows) && rows.length > 0
        ? rows[0]
        : {
            total_assessments: 0,
            completed_assessments: 0,
            in_progress_assessments: 0,
            average_score: 0,
          }

    return {
      totalAssessments: Number.parseInt(stats.total_assessments) || 0,
      completedAssessments: Number.parseInt(stats.completed_assessments) || 0,
      inProgressAssessments: Number.parseInt(stats.in_progress_assessments) || 0,
      averageScore: Number.parseFloat(stats.average_score) || 0,
    }
  } catch (error) {
    console.error("Failed to fetch assessment stats:", error)
    return {
      totalAssessments: 0,
      completedAssessments: 0,
      inProgressAssessments: 0,
      averageScore: 0,
    }
  }
}

function RecentAssessmentsList() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading recent assessments...</div>}>
      <RecentAssessmentsContent />
    </Suspense>
  )
}

async function RecentAssessmentsContent() {
  const recentAssessments = await getRecentAssessments()

  if (recentAssessments.length === 0) {
    return (
      <div className="text-center py-4">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No assessments yet</p>
        <p className="text-xs text-gray-400">Complete your first assessment to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentAssessments.map((assessment) => (
        <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-sm text-gray-900">{assessment.assessment_name}</h4>
            <p className="text-xs text-gray-600">
              {assessment.job_role_name} • {assessment.department_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {assessment.completion_percentage}% Complete
              </Badge>
              {assessment.overall_score > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Score: {assessment.overall_score.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(assessment.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Link href="/assessments">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View All Assessments
          </Button>
        </Link>
      </div>
    </div>
  )
}

function StatisticsCards() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <StatisticsContent />
    </Suspense>
  )
}

async function StatisticsContent() {
  const stats = await getAssessmentStats()

  const statisticsData = [
    {
      title: "Total Assessments",
      value: stats.totalAssessments.toString(),
      description: "All assessments created",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: stats.completedAssessments.toString(),
      description: "Fully completed assessments",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "In Progress",
      value: stats.inProgressAssessments.toString(),
      description: "Partially completed assessments",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore.toFixed(1)}%`,
      description: "Overall performance average",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statisticsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">HS1 Careers Matrix</h1>
            </div>
            <div className="flex items-center space-x-4">
              <AdminButton />
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Skills Assessment & Career Development</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Evaluate your skills, track your progress, and plan your career development with our comprehensive
            assessment tools.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Assessment Overview</h3>
          <StatisticsCards />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Self Assessment
              </CardTitle>
              <CardDescription>Evaluate your skills against role requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Complete a comprehensive self-assessment to identify your strengths and areas for development.
              </p>
              <Link href="/self-review">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Self Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Compare Skills
              </CardTitle>
              <CardDescription>Compare your skills with role requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                See how your current skills align with different roles and identify development opportunities.
              </p>
              <Link href="/compare">
                <Button variant="outline" className="w-full bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Compare Skills
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Assessments
              </CardTitle>
              <CardDescription>Your latest assessment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAssessmentsList />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Links
              </CardTitle>
              <CardDescription>Access key features and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/departments" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Departments & Roles
                  </Button>
                </Link>
                <Link href="/assessments" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Saved Assessments
                  </Button>
                </Link>
                <Link href="/self-review" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    New Self Assessment
                  </Button>
                </Link>
                <Link href="/compare" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Skills Comparison
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
