import { apiHttp } from '@/api/http'
import { createMultipartFormData } from '@/api/files/multipart'
import type { ProductInput } from '@/types/products/product.schema'
import type { Product, ProductImageFiles } from '@/types/products/product.types'

export const productApiClient = {
  async list(signal?: AbortSignal): Promise<Product[]> {
    const { data } = await apiHttp.get<Product[]>('/product', { signal, showErrorToast: false })
    return data
  },
  async get(id: string, signal?: AbortSignal): Promise<Product> {
    const { data } = await apiHttp.get<Product>(`/product/${id}`, { signal, showErrorToast: false })
    return data
  },
  async create(input: ProductInput, files?: ProductImageFiles): Promise<Product> {
    const body = createMultipartFormData({ data: input, ...files }, { jsonFields: ['data'] })
    const { data } = await apiHttp.post<Product>('/product', body, { showErrorToast: false })
    return data
  },
  async update(id: string, input: ProductInput, files?: ProductImageFiles): Promise<Product> {
    const body = createMultipartFormData({ data: input, ...files }, { jsonFields: ['data'] })
    const { data } = await apiHttp.put<Product>(`/product/${id}`, body, { showErrorToast: false })
    return data
  },
}
