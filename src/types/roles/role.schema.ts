import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  privilegeIds: z.array(z.string().uuid()),
})

export type RoleInput = z.infer<typeof roleSchema>
