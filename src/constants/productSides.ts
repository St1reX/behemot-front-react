export const PRODUCT_SIDES = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  BOTH: 'BOTH',
  NONE: 'NONE',
} as const

export type ProductSide = (typeof PRODUCT_SIDES)[keyof typeof PRODUCT_SIDES]

export const PRODUCT_SIDE_LABELS: Record<ProductSide, string> = {
  LEFT: 'Lewa',
  RIGHT: 'Prawa',
  BOTH: 'Obie strony',
  NONE: 'Nie dotyczy',
}
