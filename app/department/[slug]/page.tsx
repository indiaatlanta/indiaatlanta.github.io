import { notFound } from "next/navigation"
import DepartmentClient from "./department-client"
import { sql } from "@/lib/db"

interface Department {
  id: number
  name: string
  slug: string
  description: string
  color: string
}

async function getDepartment(slug: string): Promise<Department | null> {
  if (!sql) {
    return null
  }

  try {
    const result = await sql`
      SELECT 
        d.id,
        d.name,
        d.slug,
        d.description,
        d.color
      FROM departments d
      WHERE d.slug = ${slug}
      LIMIT 1
    `

    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error fetching department:", error)
    return null
  }
}

export default async function DepartmentPage({
  params,
}: {
  params: { slug: string }
}) {
  const department = await getDepartment(params.slug)

  if (!department) {
    notFound()
  }

  return <DepartmentClient department={department} />
}

export async function generateStaticParams() {
  if (!sql) {
    return []
  }

  try {
    const departments = await sql`
      SELECT slug FROM departments
    `

    return departments.map((dept: any) => ({
      slug: dept.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}
