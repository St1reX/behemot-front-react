export const ENTITIES = {
  AUDIT_LOG: 'AUDIT_LOG',
  USER: 'USER',
  REGISTRATION_TOKEN: 'REGISTRATION_TOKEN',
  ROLE: 'ROLE',
  DEPARTMENT: 'DEPARTMENT',
  WAREHOUSE: 'WAREHOUSE',
  CONTRACTOR: 'CONTRACTOR',
  PRODUCER: 'PRODUCER',
  CAR_BRAND: 'CAR_BRAND',
  CAR_MODEL: 'CAR_MODEL',
  CAR_GENERATION: 'CAR_GENERATION',
  PRODUCT_LISTING_TEMPLATE: 'PRODUCT_LISTING_TEMPLATE',
  PRODUCT: 'PRODUCT',
  PRODUCT_FITMENT: 'PRODUCT_FITMENT',
  PRODUCT_CROSS_REFERENCE: 'PRODUCT_CROSS_REFERENCE',
} as const

export type Entity = (typeof ENTITIES)[keyof typeof ENTITIES]

export const ENTITY_LABELS: Record<Entity, string> = {
  AUDIT_LOG: 'Logi audytowe',
  USER: 'Użytkownik',
  REGISTRATION_TOKEN: 'Aktywacja konta',
  ROLE: 'Rola',
  DEPARTMENT: 'Dział',
  WAREHOUSE: 'Magazyn',
  CONTRACTOR: 'Kontrahent',
  PRODUCER: 'Producent',
  CAR_BRAND: 'Marka pojazdu',
  CAR_MODEL: 'Model pojazdu',
  CAR_GENERATION: 'Generacja pojazdu',
  PRODUCT_LISTING_TEMPLATE: 'Szablon ogłoszenia',
  PRODUCT: 'Produkt',
  PRODUCT_FITMENT: 'Dopasowanie pojazdu',
  PRODUCT_CROSS_REFERENCE: 'Numer referencyjny',
}

export function getEntityLabel(entity: string) {
  return ENTITY_LABELS[entity as keyof typeof ENTITY_LABELS] ?? entity
}
