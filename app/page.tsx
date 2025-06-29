import Link from "next/link"
import { ExternalLink, Rocket, GitCompare, ClipboardCheck, Settings } from "lucide-react"
import { AdminButton } from "@/components/admin-button"
import { sql, isDatabaseConfigured } from "@/lib/db"
import Image from "next/image"

// Force dynamic rendering since we use cookies and database
export const dynamic = "force-dynamic"

// Fallback mock data for when database is not configured
const mockDepartments = [
  {
    id: 1,
    name: "Engineering",
    slug: "engineering",
    description: "Software development and technical roles",
    role_count: 3,
    skill_count: 45,
  },
  {
    id: 2,
    name: "Design",
    slug: "design",
    description: "Product design and user experience roles",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 3,
    name: "Customer Success",
    slug: "customer-success",
    description: "Customer support and success roles",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 4,
    name: "Marketing/Growth",
    slug: "marketing-growth",
    description: "Marketing and growth roles",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 5,
    name: "Operations",
    slug: "operations",
    description: "Operations and process roles",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 6,
    name: "People",
    slug: "people",
    description: "Human resources and people operations",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 7,
    name: "Finance",
    slug: "finance",
    description: "Finance and accounting roles",
    role_count: 0,
    skill_count: 0,
  },
  {
    id: 8,
    name: "Product",
    slug: "product",
    description: "Product management roles",
    role_count: 0,
    skill_count: 0,
  },
]

async function getDepartments() {
  if (!isDatabaseConfigured() || !sql) {
    return mockDepartments
  }

  try {
    // Count unique skills assigned to roles in each department
    // Using the correct column name from demonstration_templates table
    const departments = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        COUNT(DISTINCT jr.id) as role_count,
        COUNT(DISTINCT dt.skills_master_id) as skill_count
      FROM departments d
      LEFT JOIN job_roles jr ON d.id = jr.department_id
      LEFT JOIN demonstration_job_roles djr ON jr.id = djr.job_role_id
      LEFT JOIN demonstration_templates dt ON djr.demonstration_template_id = dt.id
      GROUP BY d.id, d.name, d.slug, d.description
      ORDER BY d.name
    `
    return departments
  } catch (error) {
    console.error("Error fetching departments:", error)
    return mockDepartments
  }
}

// Department icons mapping
const departmentIcons: Record<string, string[]> = {
  engineering: ["💻", "🔧", "📋", "⚙️", "🏠"],
  design: ["🎨", "✨", "📱", "📋", "⚙️"],
  "customer-success": ["💎", "☕", "📋", "⭐", "👥"],
  "marketing-growth": ["📧", "⭐", "📧", "🔄", "📈"],
  operations: ["🔧", "🏭", "📋", "📊", "⚙️"],
  people: ["👥", "📋", "⚙️", "📊", "💙"],
  finance: ["💰", "⚙️", "📊", "💳", "💰"],
  product: ["📋", "🔗", "📊", "📈", "📋"],
}

// Department emojis mapping
const departmentEmojis: Record<string, string> = {
  engineering: "👨‍💻",
  design: "🎨",
  "customer-success": "💙",
  "marketing-growth": "🚀",
  operations: "⚙️",
  people: "👥",
  finance: "💰",
  product: "📋",
}

export default async function Home() {
  let departments = mockDepartments

  try {
    departments = await getDepartments()
  } catch (error) {
    console.error("Error in Home page:", error)
    // Use mock data as fallback
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/hs1-logo.png" alt="Henry Schein One" width={32} height={32} className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="bg-brand-100 text-brand-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-200 transition-colors flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare Roles
              </Link>
              <Link
                href="/self-review"
                className="bg-brand-100 text-brand-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-brand-200 transition-colors flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Self Review
              </Link>
              <AdminButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Henry Schein One Career Development</h1>
            <Rocket className="w-6 h-6 text-gray-600" />
          </div>
          <Link
            href="https://careers.henryscheinone.co.uk/"
            className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm"
          >
            https://careers.henryscheinone.co.uk/
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Database Status Banner */}
        {!isDatabaseConfigured() && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-800 text-sm font-medium">Demo Mode</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  Running in preview mode. Database features are simulated for demonstration purposes.
                </p>
              </div>
              <Link
                href="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Access Admin Panel
              </Link>
            </div>
          </div>
        )}

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const icons = departmentIcons[dept.slug] || ["📋", "🔗", "📊", "📈", "⚙️"]
            const emoji = departmentEmojis[dept.slug] || "📋"

            return (
              <Link key={dept.id} href={`/department/${dept.slug}`}>
                <div className="bg-brand-800 text-white rounded-lg overflow-hidden hover:bg-brand-700 transition-colors cursor-pointer">
                  {/* Header */}
                  <div className="p-4 pb-3">
                    <h2 className="text-lg font-semibold mb-3 text-white">{dept.name}</h2>

                    {/* Icons */}
                    <div className="flex gap-3 mb-4">
                      {icons.map((icon, iconIndex) => (
                        <span key={iconIndex} className="text-brand-200 text-lg">
                          {icon}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-white text-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-lg">{emoji}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        Positions <span className="font-medium">{dept.role_count}</span>
                      </span>
                      <span>
                        Team Skills <span className="font-medium">{dept.skill_count}</span>
                      </span>
                    </div>
                    {dept.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{dept.description}</p>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
