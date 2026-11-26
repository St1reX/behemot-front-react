import { z } from 'zod';
import { apiBaseUrlSchema } from '../schemas/apiBaseUrl.schema';

export const prestashopConfigurationSchema = z
   .object({
      baseUrl: apiBaseUrlSchema,
      apiKey: z
         .string()
         .trim()
         .min(1, 'Podaj klucz API PrestaShop.')
         .max(128)
         .regex(/^[a-z0-9]+$/i, 'Klucz API może zawierać wyłącznie litery i cyfry.'),
   })
   .strict();

export type PrestashopConfigurationInput = z.infer<typeof prestashopConfigurationSchema>;
