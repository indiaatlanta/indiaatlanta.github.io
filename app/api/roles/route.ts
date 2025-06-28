import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET() {
  try {
    if (!isDatabaseConfigured() || !sql) {
      // Return mock data for demo mode
      return NextResponse.json({
        roles: [
          { id: 1, name: "Junior Engineer", code: "E1", level: 1, department_name: "Engineering", skill_count: 25 },
          { id: 2, name: "Software Engineer", code: "E2", level: 2, department_name: "Engineering", skill_count: 30 },
          { id: 3, name: "Senior Engineer", code: "E3", level: 3, department_name: "Engineering", skill_count: 35 },
          { id: 4, name:\
