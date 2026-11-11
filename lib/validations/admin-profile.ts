import { z } from "zod"

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(70, "Full name cannot exceed 70 characters"),
  avatarUrl: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^https?:\/\/.+/i.test(val),
      "Avatar URL must be a valid http or https web link"
    )
    .optional()
    .nullable(),
  designation: z
    .string()
    .trim()
    .max(100, "Designation title cannot exceed 100 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updatePreferencesSchema = z.object({
  defaultLandingPage: z
    .string()
    .trim()
    .regex(/^\/admin(\/[a-z0-9\-_]+)*$/, "Invalid admin path format")
    .default("/admin"),
  ledgerDefaultView: z.enum(["timeline", "table"]).default("timeline"),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  soundEnabled: z.boolean().default(false),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one numeric digit"),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
