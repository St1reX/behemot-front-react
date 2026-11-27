import { ENTITIES } from '@/constants/entities'
import type { Entity } from '@/constants/entities'
import type { VehicleRecord } from '@/types/vehicles/vehicle.types'

export const VEHICLE_ENTITIES = {
  brand: ENTITIES.CAR_BRAND,
  model: ENTITIES.CAR_MODEL,
  generation: ENTITIES.CAR_GENERATION,
} as const satisfies Record<VehicleRecord['type'], Entity>
