import { z } from 'zod'

export const vehicleNameSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
})

const productionYearSchema = z.number({ error: 'Podaj poprawny rok.' })
  .int('Podaj pełny rok.').min(1886, 'Rok nie może być wcześniejszy niż 1886.')

export const generationYearsSchema = z.object({
  startProduction: productionYearSchema,
  endProduction: productionYearSchema.nullable(),
}).refine((data) => data.endProduction === null || data.endProduction >= data.startProduction, {
  path: ['endProduction'],
  message: 'Koniec produkcji nie może być wcześniejszy niż jej początek.',
})

export type VehicleNameInput = z.infer<typeof vehicleNameSchema>
export type GenerationYearsInput = z.infer<typeof generationYearsSchema>
