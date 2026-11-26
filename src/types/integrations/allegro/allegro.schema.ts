import { z } from 'zod'
import { apiBaseUrlSchema } from '../schemas/apiBaseUrl.schema'

export const allegroAuthorizationSchema = z.object({
  baseUrl: apiBaseUrlSchema,
  integrationId: z.string().uuid().optional(),
  clientId: z.string().trim().min(1, 'Podaj Client ID aplikacji Allegro.').max(255)
    .regex(/^[a-z0-9-]+$/i, 'Client ID może zawierać wyłącznie litery, cyfry i myślniki.'),
  clientSecret: z.string().trim().min(1, 'Podaj Client Secret aplikacji Allegro.').max(4096),
}).strict()

export type AllegroAuthorizationInput = z.infer<typeof allegroAuthorizationSchema>
