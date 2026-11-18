import type { VehicleRecord } from '@/types/vehicles/vehicle.types'

export function getVehicleLabel(record: VehicleRecord): string {
  return record.type === 'generation'
    ? `${record.item.startProduction} – ${record.item.endProduction ?? 'obecnie'}`
    : record.item.name
}
