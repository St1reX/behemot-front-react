import { z } from 'zod';
import { apiBaseUrlSchema } from '../schemas/apiBaseUrl.schema.ts';

export const erliConfigurationSchema = z
   .object({
      baseUrl: apiBaseUrlSchema,
      token: z
         .string()
         .trim()
         .min(1, 'Podaj token API ERLI.')
         .max(8192, 'Token jest zbyt długi.')
         .regex(/^\S+$/u, 'Token nie może zawierać białych znaków.'),
   })
   .strict();

export type ErliConfigurationInput = z.infer<typeof erliConfigurationSchema>;
