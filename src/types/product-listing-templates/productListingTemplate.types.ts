export interface ProductListingTemplate {
  id: string
  name: string
  titleTemplate: string
  summaryTemplate: string
  descriptionTemplate: string
  department: { id: string; name: string; shortcut: string }
  createdAt: string
  updatedAt: string
}

export interface ListingPlaceholder {
  name: string
  label: string
  description: string
  optional: boolean
  example: string
}

export interface ListingTemplateContent {
  titleTemplate: string
  summaryTemplate: string
  descriptionTemplate: string
}

export interface ListingTemplatePreview {
  title: string
  summary: string
  description: string
}

export type ListingTemplateField = keyof ListingTemplateContent
