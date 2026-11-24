import { apiHttp } from '@/api/http'
import type { VehicleNameInput } from '@/types/vehicles/vehicle.schema'
import type {
  CarBrand, CarModel, CarGeneration, CarModelInput, CarGenerationInput, VehicleListQuery, VehiclePage,
} from '@/types/vehicles/vehicle.types'

export const vehicleApiClient = {
  brands: {
    async all(signal?: AbortSignal): Promise<CarBrand[]> {
      const { data } = await apiHttp.get<CarBrand[]>('/car-brand', { signal, showErrorToast: false })
      return data
    },
    async list(params: VehicleListQuery, signal?: AbortSignal): Promise<VehiclePage<CarBrand>> {
      const { data } = await apiHttp.get<VehiclePage<CarBrand>>('/car-brand', { params, signal, showErrorToast: false })
      return data
    },
    async get(id: string, signal?: AbortSignal): Promise<CarBrand> {
      const { data } = await apiHttp.get<CarBrand>(`/car-brand/${id}`, { signal, showErrorToast: false })
      return data
    },
    async create(input: VehicleNameInput): Promise<CarBrand> {
      const { data } = await apiHttp.post<CarBrand>('/car-brand', input, { showErrorToast: false })
      return data
    },
    async update(id: string, input: VehicleNameInput): Promise<CarBrand> {
      const { data } = await apiHttp.put<CarBrand>(`/car-brand/${id}`, input, { showErrorToast: false })
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-brand/${id}`, { showErrorToast: false })
    },
  },
  models: {
    async allByBrand(brandId: string, signal?: AbortSignal): Promise<CarModel[]> {
      const { data } = await apiHttp.get<CarModel[]>(`/car-model/brand/${brandId}`, { signal, showErrorToast: false })
      return data
    },
    async listByBrand(brandId: string, params: VehicleListQuery, signal?: AbortSignal): Promise<VehiclePage<CarModel>> {
      const { data } = await apiHttp.get<VehiclePage<CarModel>>(`/car-model/brand/${brandId}`, { params, signal, showErrorToast: false })
      return data
    },
    async get(id: string, signal?: AbortSignal): Promise<CarModel> {
      const { data } = await apiHttp.get<CarModel>(`/car-model/${id}`, { signal, showErrorToast: false })
      return data
    },
    async create(input: CarModelInput): Promise<CarModel> {
      const { data } = await apiHttp.post<CarModel>('/car-model', input, { showErrorToast: false })
      return data
    },
    async update(id: string, input: CarModelInput): Promise<CarModel> {
      const { data } = await apiHttp.put<CarModel>(`/car-model/${id}`, input, { showErrorToast: false })
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-model/${id}`, { showErrorToast: false })
    },
  },
  generations: {
    async allByModel(modelId: string, signal?: AbortSignal): Promise<CarGeneration[]> {
      const { data } = await apiHttp.get<CarGeneration[]>(`/car-generation/model/${modelId}`, { signal, showErrorToast: false })
      return data
    },
    async listByModel(modelId: string, params: VehicleListQuery, signal?: AbortSignal): Promise<VehiclePage<CarGeneration>> {
      const { data } = await apiHttp.get<VehiclePage<CarGeneration>>(`/car-generation/model/${modelId}`, { params, signal, showErrorToast: false })
      return data
    },
    async create(input: CarGenerationInput): Promise<CarGeneration> {
      const { data } = await apiHttp.post<CarGeneration>('/car-generation', input, { showErrorToast: false })
      return data
    },
    async update(id: string, input: CarGenerationInput): Promise<CarGeneration> {
      const { data } = await apiHttp.put<CarGeneration>(`/car-generation/${id}`, input, { showErrorToast: false })
      return data
    },
    async remove(id: string): Promise<void> {
      await apiHttp.delete(`/car-generation/${id}`, { showErrorToast: false })
    },
  },
}
