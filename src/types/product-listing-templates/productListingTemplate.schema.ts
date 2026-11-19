import { z } from 'zod'

function hasText(html: string): boolean {
  return Boolean(new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim())
}

export const productListingTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę szablonu.').max(100, 'Nazwa może mieć najwyżej 100 znaków.'),
  departmentId: z.uuid('Wybierz dział.'),
  titleTemplate: z.string().trim().min(1, 'Podaj tytuł.'),
  summaryTemplate: z.string().refine(hasText, 'Podaj skrót opisu.'),
  descriptionTemplate: z.string().refine(hasText, 'Podaj opis.'),
})

export type ProductListingTemplateInput = z.infer<typeof productListingTemplateSchema>
