import type { z } from 'zod'
import type { loginSchema } from '@/types/auth/schemas/auth.schema'

export type LoginInput = z.infer<typeof loginSchema>
