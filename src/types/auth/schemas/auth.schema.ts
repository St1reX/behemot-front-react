import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Wpisz poprawny adres e-mail'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
})
