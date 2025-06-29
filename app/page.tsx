import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginButton } from "@/components/login-button"
import { sql, isDatabaseConfigured } from "@/lib/db"

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    // Return demo data when database is not configured
    return [
      {
        slug: "engineering",
        name: "Engineering",
        description: "Software development and technical roles",
        role_count: 8,
      },
      { slug: "product", name: "Product", description: "Product management and design roles", role_count: 5 },
      { slug: "sales", name: "Sales", description: "Sales and business development roles", role_count: 6 },
      { slug: "marketing", name: "Marketing", description: "Marketing and communications roles", role_count: 4 },
    ]
  }

  try {
    const departments = await sql`
      SELECT 
        d.slug,
        d.name,
        d.description,
        COUNT(DISTINCT jr.id) as role_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      GROUP BY d.id, d.slug, d.name, d.description
      ORDER BY d.name
    `
    return departments
  } catch (error) {
    console.error("Error fetching departments:", error)
    // Return demo data as fallback
    return [
      {
        slug: "engineering",
        name: "Engineering",
        description: "Software development and technical roles",
        role_count: 8,
      },
      { slug: "product", name: "Product", description: "Product management and design roles", role_count: 5 },
      { slug: "sales", name: "Sales", description: "Sales and business development roles", role_count: 6 },
      { slug: "marketing", name: "Marketing", description: "Marketing and communications roles", role_count: 4 },
    ]
  }
}

export default async function HomePage() {
  const departments = await getDepartments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img src="/images/hs1-logo.png" alt="Henry Schein One" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HS1 Careers Matrix</h1>
                <p className="text-gray-600">Explore career paths and skill requirements</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Career Path</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore different departments, understand role requirements, and map your skills to career opportunities at
            Henry Schein One.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/compare">Compare Roles</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/self-review">Self Assessment</Link>
            </Button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                    <Badge variant="secondary">{dept.role_count} roles</Badge>
                  </div>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/department/${dept.slug}`}>View Skills Matrix</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Evaluate your current skills and identify areas for growth with our comprehensive assessment tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                Role Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Compare different roles side-by-side to understand skill requirements and career progression paths.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                Career Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Plan your career journey with personalized recommendations and skill development roadmaps.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Henry Schein One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
