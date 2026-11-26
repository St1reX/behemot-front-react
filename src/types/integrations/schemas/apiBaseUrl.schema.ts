import { z } from 'zod'

export const apiBaseUrlSchema = z.string().trim().url('Podaj prawidłowy adres API.').max(2048)
  .refine((value) => {
    try {
      const url = new URL(value)
      return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash
    } catch {
      return false
    }
  }, 'Podaj adres HTTPS bez danych logowania, parametrów i fragmentu URL.')
