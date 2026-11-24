import { apiHttp } from '@/api/http'
import type { Warehouse } from '@/types/warehouses/warehouse.types'
import type { WarehouseInput } from '@/types/warehouses/warehouse.schema'

export const warehouseApiClient = {
  async list(signal?: AbortSignal): Promise<Warehouse[]> {
    const { data } = await apiHttp.get<Warehouse[]>('/warehouse', { signal, showErrorToast: false })
    return data
  },
  async create(input: WarehouseInput): Promise<Warehouse> {
    const { data } = await apiHttp.post<Warehouse>('/warehouse', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: WarehouseInput): Promise<Warehouse> {
    const { data } = await apiHttp.put<Warehouse>(`/warehouse/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/warehouse/${id}`, { showErrorToast: false })
  },
}
