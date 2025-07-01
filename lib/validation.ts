import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "admin"], { errorMap: () => ({ message: "Role must be either 'user' or 'admin'" }) }),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(255, "Skill name too long"),
  level: z.string().regex(/^[A-Z]\d+$/, "Level must be in format like L1, L2, M1, M2, etc."),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  fullDescription: z.string().min(1, "Full description is required").max(10000, "Full description too long"),
  categoryId: z.number().int().positive("Invalid category"),
  jobRoleId: z.number().int().positive("Invalid job role"),
  sortOrder: z.number().int().min(0).optional(),
})

export const skillMasterSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(255, "Skill name too long"),
  description: z.string().min(1, "Description is required").max(10000, "Description too long"),
  categoryId: z.number().int().positive("Invalid category"),
  sortOrder: z.number().int().min(0).optional(),
})

export const skillDemonstrationSchema = z.object({
  skillMasterId: z.number().int().positive("Invalid skill"),
  jobRoleId: z.number().int().positive("Invalid job role"),
  level: z.string().regex(/^[A-Z]\d+$/, "Level must be in format like L1, L2, M1, M2, etc."),
  demonstrationDescription: z
    .string()
    .min(1, "Demonstration description is required")
    .max(2000, "Description too long"),
  sortOrder: z.number().int().min(0).optional(),
})

export const bulkSkillsSchema = z.object({
  skills: z.array(skillSchema).min(1, "At least one skill is required"),
})

export const jobRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255, "Role name too long"),
  code: z.string().min(1, "Role code is required").max(50, "Role code too long"),
  departmentId: z.number().int().positive("Invalid department"),
  level: z.number().int().min(1).max(10).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  locationType: z.string().max(50).optional(),
})

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(255, "Department name too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug too long"),
  description: z.string().max(2000, "Description too long").optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type UserInput = z.infer<typeof userSchema>
export type SkillInput = z.infer<typeof skillSchema>
export type SkillMasterInput = z.infer<typeof skillMasterSchema>
export type SkillDemonstrationInput = z.infer<typeof skillDemonstrationSchema>
export type BulkSkillsInput = z.infer<typeof bulkSkillsSchema>
export type JobRoleInput = z.infer<typeof jobRoleSchema>
export type DepartmentInput = z.infer<typeof departmentSchema>
