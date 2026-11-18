import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki')
    .max(25, 'Nazwa użytkownika może mieć najwyżej 25 znaków'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
})

export const registerSchema = loginSchema.extend({
  email: z.email('Wpisz poprawny adres e-mail'),
})
