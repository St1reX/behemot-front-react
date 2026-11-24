import { z } from 'zod'

export const warehouseSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  postalCode: z.string().trim().min(1, 'Podaj kod pocztowy.').max(20, 'Kod pocztowy może mieć najwyżej 20 znaków.'),
  city: z.string().trim().min(1, 'Podaj miejscowość.').max(100, 'Miejscowość może mieć najwyżej 100 znaków.'),
  street: z.string().trim().min(1, 'Podaj ulicę.').max(100, 'Ulica może mieć najwyżej 100 znaków.'),
  buildingNumber: z.string().trim().min(1, 'Podaj numer budynku.').max(20, 'Numer budynku może mieć najwyżej 20 znaków.'),
})

export type WarehouseInput = z.infer<typeof warehouseSchema>
