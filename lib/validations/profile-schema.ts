import { z } from 'zod'

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: z
    .string()
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
