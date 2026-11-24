import { z } from 'zod'

export const userSchema = z.object({
  username: z.string().trim().min(3, 'Nazwa musi mieć co najmniej 3 znaki.').max(25, 'Nazwa może mieć najwyżej 25 znaków.'),
  email: z.string().trim().email('Podaj prawidłowy adres e-mail.'),
  roleId: z.string().uuid('Wybierz rolę.'),
  isActive: z.boolean(),
  password: z.string(),
})

export const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków.'),
})

export type UserInput = z.infer<typeof userSchema>
