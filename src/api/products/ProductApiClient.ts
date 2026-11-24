import { apiHttp } from '@/api/http'
import type { ProductInput } from '@/types/products/product.schema'
import type { Product } from '@/types/products/product.types'

export const productApiClient = {
  async list(signal?: AbortSignal): Promise<Product[]> {
    const { data } = await apiHttp.get<Product[]>('/product', { signal, showErrorToast: false })
    return data
  },
  async get(id: string, signal?: AbortSignal): Promise<Product> {
    const { data } = await apiHttp.get<Product>(`/product/${id}`, { signal, showErrorToast: false })
    return data
  },
  async create(input: ProductInput): Promise<Product> {
    const { data } = await apiHttp.post<Product>('/product', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: ProductInput): Promise<Product> {
    const { data } = await apiHttp.put<Product>(`/product/${id}`, input, { showErrorToast: false })
    return data
  },
}
