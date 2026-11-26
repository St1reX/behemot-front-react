import { z } from 'zod'

export const prestashopConfigurationSchema = z.object({
  baseUrl: z.string().trim().url('Podaj prawidłowy adres sklepu.').max(2048)
    .refine((value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash
      } catch {
        return false
      }
    }, 'Podaj adres HTTPS bez danych logowania, parametrów i fragmentu URL.'),
  apiKey: z.string().trim().min(1, 'Podaj klucz API PrestaShop.').max(128)
    .regex(/^[a-z0-9]+$/i, 'Klucz API może zawierać wyłącznie litery i cyfry.'),
}).strict()

export type PrestashopConfigurationInput = z.infer<typeof prestashopConfigurationSchema>
