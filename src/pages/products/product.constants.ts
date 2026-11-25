import type { IntegrationChannel, ProductSide } from '@/types/products/product.types'

export const SIDE_LABELS: Record<ProductSide, string> = {
  LEFT: 'Lewa',
  RIGHT: 'Prawa',
  BOTH: 'Obie strony',
  NONE: 'Nie dotyczy',
}

export const CHANNEL_LABELS: Record<IntegrationChannel, string> = {
  ALLEGRO: 'Allegro',
  BASELINKER: 'BaseLinker',
  PRESTASHOP: 'PrestaShop',
}

export const PRODUCT_IMAGE_FIELDS = { PRODUCT: 'productPhotoes', DESCRIPTION: 'descProductPhotoes' } as const
export const PRODUCT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PRODUCT_IMAGE_MAX_SIZE = 10 * 1024 * 1024
export const PRODUCT_MAX_IMAGES_PER_UPLOAD_FIELD = 20
export const PRODUCT_UPLOAD_DATA_FIELD = 'data'
export const EMPTY_PRODUCT_IMAGE_FILES = { productPhotoes: [], descProductPhotoes: [] }
