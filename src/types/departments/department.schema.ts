import { z } from 'zod'

export const departmentSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  shortcut: z.string().trim().toUpperCase().min(1, 'Podaj skrót.').max(2, 'Skrót może mieć najwyżej 2 znaki.'),
})

export type DepartmentInput = z.infer<typeof departmentSchema>
