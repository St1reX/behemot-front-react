import { z } from 'zod'
import { PRODUCT_SIDES } from '@/constants/productSides'

const decimal = z.number({ error: 'Podaj liczbę.' }).min(0, 'Wartość nie może być ujemna.').max(9999.99, 'Maksymalna wartość to 9999,99.').refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, 'Maksymalnie dwa miejsca po przecinku.')
const dimension = decimal.refine((value) => value > 0, 'Wartość musi być większa od zera.')
const uuid = z.uuid('Wybierz wartość z listy.')
const nullableText = z.string().nullable()
export const productSchema = z.object({
  sku: z.string().trim().min(1, 'Podaj SKU.'),
  ean: nullableText,
  oem: z.array(z.string().min(1)),
  customName: z.string().max(255).nullable(),
  customSummary: nullableText,
  customDescription: nullableText,
  internalNote: nullableText,
  price: decimal,
  side: z.enum(PRODUCT_SIDES),
  weight: dimension, length: dimension, width: dimension, height: dimension.nullable(),
  warehouseLocation: z.string().trim().min(1, 'Podaj lokalizację w magazynie.'),
  warehouseId: uuid, producerId: uuid, departmentId: uuid, listingTemplateId: uuid,
  imagesUrls: z.array(z.url('Podaj poprawny adres zdjęcia.').refine((url) => /^https?:\/\//i.test(url), 'Użyj adresu HTTP lub HTTPS.')),
  descriptionImagesUrls: z.array(z.url('Podaj poprawny adres zdjęcia.').refine((url) => /^https?:\/\//i.test(url), 'Użyj adresu HTTP lub HTTPS.')),
  productFitments: z.array(z.object({
    id: z.uuid().optional(), carBrandId: uuid.nullable(), carModelId: uuid.nullable(), carGenerationId: uuid.nullable(), isPrimary: z.boolean(),
  }).refine((fitment) => fitment.carBrandId || fitment.carModelId || fitment.carGenerationId, { message: 'Wybierz markę.', path: ['carBrandId'] }))
    .superRefine((fitments, ctx) => {
      if (fitments.length && fitments.filter((fitment) => fitment.isPrimary).length !== 1) ctx.addIssue({ code: 'custom', message: 'Wybierz jedno główne dopasowanie.' })
      const keys = fitments.map((fitment) => [fitment.carBrandId, fitment.carModelId, fitment.carGenerationId].join(':'))
      if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', message: 'Usuń powtórzone dopasowania.' })
    }),
})
export type ProductInput = z.infer<typeof productSchema>
