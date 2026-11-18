import type { z } from 'zod'
import type { loginSchema, registerSchema } from '@/types/auth/schemas/auth.schema'

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
