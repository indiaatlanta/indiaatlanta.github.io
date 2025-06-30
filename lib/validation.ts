import { z } from "zod"

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required").max(50, "Category must be less than 50 characters"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  full_description: z.string().max(2000, "Full description must be less than 2000 characters").optional(),
})

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "admin"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
})

export const jobRoleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  department_id: z.number().int().positive("Department ID must be a positive integer"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  requirements: z.string().max(2000, "Requirements must be less than 2000 characters").optional(),
})

export const skillDemonstrationSchema = z.object({
  skill_id: z.number().int().positive("Skill ID must be a positive integer"),
  demonstration: z
    .string()
    .min(1, "Demonstration is required")
    .max(1000, "Demonstration must be less than 1000 characters"),
})

export type SkillInput = z.infer<typeof skillSchema>
export type UserInput = z.infer<typeof userSchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
export type JobRoleInput = z.infer<typeof jobRoleSchema>
export type SkillDemonstrationInput = z.infer<typeof skillDemonstrationSchema>
