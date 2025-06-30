"use client"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminClient from "./admin-client"

interface Skill {
  id: number
  name: string
  level: string
  description: string
  full_description: string
  category_id: number
  category_name: string
  category_color: string
  job_role_id: number
  sort_order: number
}

interface AuditLog {
  id: number
  user_name: string
  user_email: string
  action: string
  table_name: string
  record_id: number
  old_values: any
  new_values: any
  created_at: string
}

const skillCategories = [
  { id: 1, name: "Technical Skills", color: "blue" },
  { id: 2, name: "Delivery", color: "green" },
  { id: 3, name: "Feedback, Communication & Collaboration", color: "purple" },
  { id: 4, name: "Leadership", color: "indigo" },
  { id: 5, name: "Strategic Impact", color: "orange" },
]

const skillLevels = ["L1", "L2", "L3", "L4", "L5"]

// Mock data for demo mode
const mockSkills: Skill[] = [
  {
    id: 1,
    name: "Security",
    level: "L1",
    description: "Understands the importance of security.",
    full_description:
      "Security is a fundamental aspect of software engineering that encompasses understanding and implementing measures to protect systems, data, and users from various threats and vulnerabilities.\n\nAt the L1 level, engineers should understand basic security principles, common vulnerabilities, and secure coding practices.",
    category_id: 1,
    category_name: "Technical Skills",
    category_color: "blue",
    job_role_id: 1,
    sort_order: 0,
  },
  {
    id: 2,
    name: "Work Breakdown",
    level: "L2",
    description: "Understands value of rightsizing pieces of work to enable continuous deployment.",
    full_description:
      "Work Breakdown is the practice of decomposing large, complex work items into smaller, manageable pieces that can be delivered incrementally and continuously deployed.\n\nAt the L2 level, engineers should understand the value of small, independent work items for faster feedback cycles.",
    category_id: 2,
    category_name: "Delivery",
    category_color: "green",
    job_role_id: 1,
    sort_order: 0,
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    user_name: "Demo Admin",
    user_email: "admin@henryscheinone.com",
    action: "CREATE",
    table_name: "skills",
    record_id: 1,
    old_values: null,
    new_values: { name: "Security", level: "L1" },
    created_at: new Date().toISOString(),
  },
]

export default async function AdminPage() {
  console.log("AdminPage: Getting current user")
  const user = await getCurrentUser()

  if (!user) {
    console.log("AdminPage: No user found, redirecting to login")
    redirect("/login")
  }

  if (user.role !== "admin") {
    console.log("AdminPage: Non-admin user, redirecting to home")
    redirect("/")
  }

  console.log("AdminPage: Admin user found:", user.email)
  return <AdminClient user={user} />
}
