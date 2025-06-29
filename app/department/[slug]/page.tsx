import { Suspense } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import LoginButton from "@/components/login-button"
import AdminButton from "@/components/admin-button"
import DepartmentClient from "./department-client"
import { sql, isDatabaseConfigured } from "@/lib/db"

interface Department {
  id: number
  name: string
  slug: string
  description: string
}

async function getDepartment(slug: string): Promise<Department | null> {
  if (!isDatabaseConfigured() || !sql) {
    // Return mock data for preview
    const mockDepartments: Record<string, Department> = {
      engineering: {
        id: 1,
        name: "Engineering",
        slug: "engineering",
        description: "Software development and technical roles",
      },
      product: {
        id: 2,
        name: "Product",
        slug: "product",
        description: "Product management and design roles",
      },
      sales: {
        id: 3,
        name: "Sales",
        slug: "sales",
        description: "Sales and business development roles",
      },
      marketing: {
        id: 4,
        name: "Marketing",
        slug: "marketing",
        description: "Marketing and communications roles",
      },
    }
    return mockDepartments[slug] || null
  }

  try {
    const departments = await sql`
      SELECT id, name, slug, description
      FROM departments
      WHERE slug = ${slug}
    `
    return departments[0] || null
  } catch (error) {
    console.error("Error fetching department:", error)
    return null
  }
}

export default async function DepartmentPage({ params }: { params: { slug: string } }) {
  const department = await getDepartment(params.slug)

  if (!department) {
    notFound()
  }

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
                  <p className="text-sm text-gray-500">{department.name} Department</p>
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
              ← Back to Departments
            </Link>
            <div className="flex space-x-6">
              <Link href="/compare" className="text-sm text-gray-600 hover:text-gray-900">
                Compare Roles
              </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{department.name} Skills Matrix</h2>
          <p className="text-lg text-gray-600 mb-6">{department.description}</p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          }
        >
          <DepartmentClient departmentSlug={department.slug} departmentName={department.name} />
        </Suspense>
      </main>
    </div>
  )
}
