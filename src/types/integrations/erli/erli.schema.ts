import { z } from 'zod'

export const erliConfigurationSchema = z.object({
  token: z.string().trim().min(1, 'Podaj token API ERLI.').max(8192, 'Token jest zbyt długi.')
    .regex(/^\S+$/u, 'Token nie może zawierać białych znaków.'),
}).strict()

export type ErliConfigurationInput = z.infer<typeof erliConfigurationSchema>
