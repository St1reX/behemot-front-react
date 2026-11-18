import { z } from 'zod'

export const contractorSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
})

export type ContractorInput = z.infer<typeof contractorSchema>
