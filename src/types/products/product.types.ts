import type { CarGeneration, CarModel } from '@/types/vehicles/vehicle.types'

export type ProductSide = 'LEFT' | 'RIGHT' | 'BOTH' | 'NONE'
export type IntegrationChannel = 'ALLEGRO' | 'BASELINKER' | 'PRESTASHOP'
export interface ProductFitment {
  id: string
  isPrimary: boolean
  carBrand: { id: string; name: string } | null
  carModel: Pick<CarModel, 'id' | 'name' | 'carBrand'> | null
  carGeneration: Omit<CarGeneration, 'createdAt' | 'updatedAt'> | null
}
export interface ProductExternalListing {
  id: string
  channel: IntegrationChannel
  externalId: string | null
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED'
  lastSyncedAt: string | null
  lastError: string | null
}
export interface Product {
  id: string
  sku: string
  ean: string | null
  oem: string[]
  customName: string | null
  customSummary: string | null
  customDescription: string | null
  internalNote: string | null
  title: string | null
  summary: string | null
  description: string | null
  listingContentError: string | null
  imagesUrls: string[]
  descriptionImagesUrls: string[]
  price: string
  quantity: number
  side: ProductSide
  weight: string
  length: string
  width: string
  height: string | null
  warehouseLocation: string
  warehouse: { id: string; name: string }
  listingTemplate: { id: string; name: string }
  department: { id: string; name: string; shortcut: string }
  producer: { id: string; name: string }
  primaryFitment: ProductFitment | null
  productFitments: ProductFitment[]
  externalListings: ProductExternalListing[]
  createdAt: string
  updatedAt: string
}
