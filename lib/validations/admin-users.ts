import { z } from "zod"

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "FINANCE"] as const

export const createAdminUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  role: z.enum(ADMIN_ROLES, {
    message: "Please select a valid system role",
  }),
})

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>

export const updateAdminUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .optional(),
  role: z.enum(ADMIN_ROLES).optional(),
  is_active: z.boolean().optional(),
})

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>
