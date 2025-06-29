import { z } from "zod"

// User validation schemas
export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "user"]).default("user"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Department validation schemas
export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  slug: z
    .string()
    .min(1, "Department slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .default("#3B82F6"),
  sort_order: z.number().int().min(0).default(0),
})

// Job role validation schemas
export const jobRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  title: z.string().min(1, "Role title is required"),
  code: z.string().min(1, "Role code is required"),
  department_id: z.number().int().positive("Department ID is required"),
  level: z.number().int().min(1).max(10).default(1),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  location_type: z.string().default("Hybrid"),
  description: z.string().optional(),
  full_description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
})

// Skill validation schemas
export const skillCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().min(1, "Color is required").default("blue"),
  sort_order: z.number().int().min(0).default(0),
})

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category_id: z.number().int().positive("Category ID is required"),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
})

// Demonstration template validation schemas
export const demonstrationTemplateSchema = z.object({
  skill_id: z.number().int().positive("Skill ID is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  description: z.string().optional(),
  demonstration_description: z.string().min(1, "Demonstration description is required"),
})

// Bulk operations schemas
export const bulkSkillsSchema = z.object({
  skills: z
    .array(
      skillSchema.extend({
        id: z.number().int().positive().optional(),
      }),
    )
    .min(1, "At least one skill is required"),
})

export const bulkJobRolesSchema = z.object({
  roles: z
    .array(
      jobRoleSchema.extend({
        id: z.number().int().positive().optional(),
      }),
    )
    .min(1, "At least one role is required"),
})

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

// Self-review and comparison schemas
export const selfReviewSchema = z.object({
  user_id: z.number().int().positive().optional(),
  role_id: z.number().int().positive("Role ID is required"),
  skill_assessments: z
    .array(
      z.object({
        skill_id: z.number().int().positive(),
        self_rating: z.number().int().min(1).max(5),
        notes: z.string().optional(),
      }),
    )
    .min(1, "At least one skill assessment is required"),
  overall_notes: z.string().optional(),
})

export const roleComparisonSchema = z.object({
  role_ids: z
    .array(z.number().int().positive())
    .min(2, "At least two roles are required for comparison")
    .max(5, "Maximum 5 roles can be compared"),
  user_id: z.number().int().positive().optional(),
})

// Export utility functions
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      return { success: false, error: errorMessage }
    }
    return { success: false, error: "Validation failed" }
  }
}

export function validatePartialRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: Partial<T> } | { success: false; error: string } {
  try {
    const partialSchema = schema.partial()
    const validatedData = partialSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      return { success: false, error: errorMessage }
    }
    return { success: false, error: "Validation failed" }
  }
}
