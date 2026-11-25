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
