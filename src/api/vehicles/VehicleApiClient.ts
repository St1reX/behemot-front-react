import { apiHttp } from '@/api/http'
import type { VehicleNameInput } from '@/types/vehicles/vehicle.schema'
import type {
  CarBrand, CarModel, CarGeneration, CarModelInput, CarGenerationInput,
} from '@/types/vehicles/vehicle.types'

export const vehicleApiClient = {
  brands: {
    async list(signal?: AbortSignal): Promise<CarBrand[]> {
      const { data } = await apiHttp.get<CarBrand[]>('/car-brand', { signal })
      return data
    },
    async create(input: VehicleNameInput): Promise<CarBrand> {
      const { data } = await apiHttp.post<CarBrand>('/car-brand', input)
      return data
    },
    async update(id: string, input: VehicleNameInput): Promise<CarBrand> {
      const { data } = await apiHttp.put<CarBrand>(`/car-brand/${id}`, input)
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-brand/${id}`)
    },
  },
  models: {
    async listByBrand(brandId: string, signal?: AbortSignal): Promise<CarModel[]> {
      const { data } = await apiHttp.get<CarModel[]>(`/car-model/brand/${brandId}`, { signal })
      return data
    },
    async create(input: CarModelInput): Promise<CarModel> {
      const { data } = await apiHttp.post<CarModel>('/car-model', input)
      return data
    },
    async update(id: string, input: CarModelInput): Promise<CarModel> {
      const { data } = await apiHttp.put<CarModel>(`/car-model/${id}`, input)
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-model/${id}`)
    },
  },
  generations: {
    async listByModel(modelId: string, signal?: AbortSignal): Promise<CarGeneration[]> {
      const { data } = await apiHttp.get<CarGeneration[]>(`/car-generation/model/${modelId}`, { signal })
      return data
    },
    async create(input: CarGenerationInput): Promise<CarGeneration> {
      const { data } = await apiHttp.post<CarGeneration>('/car-generation', input)
      return data
    },
    async update(id: string, input: CarGenerationInput): Promise<CarGeneration> {
      const { data } = await apiHttp.put<CarGeneration>(`/car-generation/${id}`, input)
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-generation/${id}`)
    },
  },
}
