import type { ProductFitment } from '@/types/products/product.types'

export function formatPrice(price: string | number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(price))
}

export function formatFitment(fitment: ProductFitment) {
  const generation = fitment.carGeneration
  const model = fitment.carModel ?? generation?.carModel
  const brand = fitment.carBrand ?? model?.carBrand
  return [brand?.name, model?.name, generation ? `${generation.startProduction}–${generation.endProduction ?? 'obecnie'}` : null].filter(Boolean).join(' ')
}
