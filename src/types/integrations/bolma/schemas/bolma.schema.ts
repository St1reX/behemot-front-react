import { z } from 'zod'

export const bolmaStatusSchema = z.object({
  status: z.enum(['ok', 'error']),
  components: z.object({
    database: z.enum(['ok', 'error']),
  }),
})

export type BolmaStatusResponse = z.infer<typeof bolmaStatusSchema>
