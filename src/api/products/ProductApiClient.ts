import { apiHttp } from '@/api/http'
import type { ProductInput } from '@/types/products/product.schema'
import { PRODUCT_IMAGE_FIELDS, PRODUCT_UPLOAD_DATA_FIELD } from '@/pages/products/product.constants'
import type { Product, ProductImageFiles } from '@/types/products/product.types'

function productRequest(input: ProductInput, files?: ProductImageFiles) {
  if (!files || (!files.productPhotoes.length && !files.descProductPhotoes.length)) return input
  const body = new FormData()
  body.append(PRODUCT_UPLOAD_DATA_FIELD, JSON.stringify(input))
  for (const field of Object.values(PRODUCT_IMAGE_FIELDS)) {
    for (const file of files[field]) body.append(field, file)
  }
  return body
}

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
    const { data } = await apiHttp.post<Product>('/product', productRequest(input, files), { showErrorToast: false })
    return data
  },
  async update(id: string, input: ProductInput, files?: ProductImageFiles): Promise<Product> {
    const { data } = await apiHttp.put<Product>(`/product/${id}`, productRequest(input, files), { showErrorToast: false })
    return data
  },
}
