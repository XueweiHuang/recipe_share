import { z } from 'zod'

/**
 * Email validation schema
 * Validates email format
 */
export const emailSchema = z.string().email('Invalid email format')

/**
 * Password validation schema
 * - Minimum 6 characters
 * - Required field
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

/**
 * Username validation schema
 * - Alphanumeric and underscores only
 * - 3-20 characters
 * - Required field
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

/**
 * Signup form validation schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  fullName: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
