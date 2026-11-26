import type { MarketplaceIntegrationChannel } from '@/types/integrations/integration.types'
import type { CarGeneration, CarModel } from '@/types/vehicles/vehicle.types'

export type ProductSide = 'LEFT' | 'RIGHT' | 'BOTH' | 'NONE'
export interface ProductFitment {
  id: string
  isPrimary: boolean
  carBrand: { id: string; name: string } | null
  carModel: Pick<CarModel, 'id' | 'name' | 'carBrand'> | null
  carGeneration: Omit<CarGeneration, 'createdAt' | 'updatedAt'> | null
}
export interface ProductExternalListing {
  id: string
  integrationId: string
  integration: { id: string; name: string }
  lastSyncedContentVersion: number | null
  channel: MarketplaceIntegrationChannel
  externalId: string | null
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED'
  lastSyncedAt: string | null
  lastError: string | null
}
export interface Product {
  id: string
  isLegacy: boolean
  contentVersion: number
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
  price: string | null
  quantity: number | null
  side: ProductSide | null
  weight: string | null
  length: string | null
  width: string | null
  height: string | null
  warehouseLocation: string | null
  warehouse: { id: string; name: string } | null
  listingTemplate: { id: string; name: string } | null
  department: { id: string; name: string; shortcut: string } | null
  producer: { id: string; name: string } | null
  primaryFitment: ProductFitment | null
  productFitments: ProductFitment[]
  externalListings: ProductExternalListing[]
  createdAt: string
  updatedAt: string
}

export interface ProductImageFiles {
  productPhotoes: File[]
  descProductPhotoes: File[]
}
