import { z } from 'zod';
import { apiBaseUrlSchema } from '../schemas/apiBaseUrl.schema.ts';

export const emagMarketSchema = z.enum(['RO', 'BG', 'HU']);
export type EmagMarket = z.infer<typeof emagMarketSchema>;

export const emagConfigurationSchema = z
   .object({
      baseUrl: apiBaseUrlSchema,
      market: emagMarketSchema,
      username: z.string().trim().email('Podaj prawidłowy adres e-mail konta eMAG.').max(255),
      password: z.string().min(1, 'Podaj hasło konta eMAG.').max(4096),
   })
   .strict();

export type EmagConfigurationInput = z.infer<typeof emagConfigurationSchema>;
