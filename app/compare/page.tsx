import { sql, isDatabaseConfigured } from "@/lib/db"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import CompareClient from "./compare-client"

// Demo data for when database is not configured
const demoRoles = [
  {
    id: 1,
    title: "Junior Software Engineer",
    level: "E1",
    department: "Engineering",
    description: "Entry-level position focused on learning and contributing to team projects under guidance.",
    skills: [
      {
        skill: {
          id: 1,
          name: "JavaScript",
          category: "Programming Languages",
          description: "Core programming language for web development",
        },
        required_level: 2,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 2,
          name: "HTML/CSS",
          category: "Web Technologies",
          description: "Markup and styling languages for web interfaces",
        },
        required_level: 2,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 3,
          name: "Git Version Control",
          category: "Development Tools",
          description: "Version control system for code management",
        },
        required_level: 2,
        importance: "important" as const,
      },
      {
        skill: {
          id: 4,
          name: "Problem Solving",
          category: "Core Skills",
          description: "Ability to analyze and solve technical problems",
        },
        required_level: 2,
        importance: "critical" as const,
      },
    ],
  },
  {
    id: 2,
    title: "Senior Software Engineer",
    level: "E3",
    department: "Engineering",
    description: "Experienced engineer who leads projects and mentors junior team members.",
    skills: [
      {
        skill: {
          id: 1,
          name: "JavaScript",
          category: "Programming Languages",
          description: "Core programming language for web development",
        },
        required_level: 4,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 2,
          name: "HTML/CSS",
          category: "Web Technologies",
          description: "Markup and styling languages for web interfaces",
        },
        required_level: 3,
        importance: "important" as const,
      },
      {
        skill: {
          id: 3,
          name: "Git Version Control",
          category: "Development Tools",
          description: "Version control system for code management",
        },
        required_level: 4,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 4,
          name: "Problem Solving",
          category: "Core Skills",
          description: "Ability to analyze and solve technical problems",
        },
        required_level: 4,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 5,
          name: "System Architecture",
          category: "Technical Design",
          description: "Designing scalable and maintainable system architectures",
        },
        required_level: 3,
        importance: "important" as const,
      },
      {
        skill: {
          id: 6,
          name: "Mentoring",
          category: "Leadership",
          description: "Guiding and developing junior team members",
        },
        required_level: 3,
        importance: "important" as const,
      },
      {
        skill: {
          id: 7,
          name: "Code Review",
          category: "Development Process",
          description: "Reviewing and providing feedback on code quality",
        },
        required_level: 4,
        importance: "critical" as const,
      },
    ],
  },
  {
    id: 3,
    title: "Principal Engineer",
    level: "E5",
    department: "Engineering",
    description: "Senior technical leader who drives architectural decisions and strategic initiatives.",
    skills: [
      {
        skill: {
          id: 1,
          name: "JavaScript",
          category: "Programming Languages",
          description: "Core programming language for web development",
        },
        required_level: 4,
        importance: "important" as const,
      },
      {
        skill: {
          id: 3,
          name: "Git Version Control",
          category: "Development Tools",
          description: "Version control system for code management",
        },
        required_level: 4,
        importance: "important" as const,
      },
      {
        skill: {
          id: 4,
          name: "Problem Solving",
          category: "Core Skills",
          description: "Ability to analyze and solve technical problems",
        },
        required_level: 5,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 5,
          name: "System Architecture",
          category: "Technical Design",
          description: "Designing scalable and maintainable system architectures",
        },
        required_level: 5,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 6,
          name: "Mentoring",
          category: "Leadership",
          description: "Guiding and developing junior team members",
        },
        required_level: 4,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 7,
          name: "Code Review",
          category: "Development Process",
          description: "Reviewing and providing feedback on code quality",
        },
        required_level: 4,
        importance: "important" as const,
      },
      {
        skill: {
          id: 8,
          name: "Technical Strategy",
          category: "Strategic Planning",
          description: "Developing long-term technical roadmaps and strategies",
        },
        required_level: 4,
        importance: "critical" as const,
      },
      {
        skill: {
          id: 9,
          name: "Cross-team Collaboration",
          category: "Leadership",
          description: "Working effectively across multiple teams and departments",
        },
        required_level: 5,
        importance: "critical" as const,
      },
    ],
  },
]

async function getRoles() {
  if (!isDatabaseConfigured() || !sql) {
    return demoRoles
  }

  try {
    const roles = await sql`
      SELECT 
        jr.id,
        jr.title,
        jr.level,
        d.name as department,
        jr.description,
        COALESCE(
          json_agg(
            json_build_object(
              'skill', json_build_object(
                'id', sm.id,
                'name', sm.name,
                'category', sm.category,
                'description', sm.description
              ),
              'required_level', rs.required_level,
              'importance', rs.importance
            )
          ) FILTER (WHERE sm.id IS NOT NULL),
          '[]'::json
        ) as skills
      FROM job_roles jr
      LEFT JOIN departments d ON jr.department_id = d.id
      LEFT JOIN role_skills rs ON jr.id = rs.role_id
      LEFT JOIN skills_master sm ON rs.skill_id = sm.id
      GROUP BY jr.id, jr.title, jr.level, d.name, jr.description
      ORDER BY jr.level, jr.title
    `

    return roles.map((role: any) => ({
      ...role,
      skills: Array.isArray(role.skills) ? role.skills : [],
    }))
  } catch (error) {
    console.error("Error fetching roles:", error)
    return demoRoles
  }
}

export default async function ComparePage() {
  const roles = await getRoles()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                <Image
                  src="/images/hs1-logo.png"
                  alt="Henry Schein One"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Career Matrix</h1>
                  <p className="text-sm text-gray-500">Role Comparison</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Suspense fallback={<div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />}>
                <LoginButton />
              </Suspense>
              <Suspense fallback={<div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />}>
                <AdminButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-12">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
            <div className="flex space-x-6">
              <span className="text-sm font-medium text-gray-900">Compare Roles</span>
              <Link href="/self-review" className="text-sm text-gray-600 hover:text-gray-900">
                Self Assessment
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Compare Job Roles</h2>
          <p className="text-lg text-gray-600 mb-6">
            Select two job roles to compare their skill requirements and understand career progression paths.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          }
        >
          <CompareClient roles={roles} isDemoMode={true} />
        </Suspense>
      </main>
    </div>
  )
}
