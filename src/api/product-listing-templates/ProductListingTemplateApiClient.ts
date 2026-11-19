import { apiHttp } from '@/api/http'
import type { ProductListingTemplateInput } from '@/types/product-listing-templates/productListingTemplate.schema'
import type {
  ListingPlaceholder, ListingTemplateContent, ListingTemplatePreview, ProductListingTemplate,
} from '@/types/product-listing-templates/productListingTemplate.types'

export const productListingTemplateApiClient = {
  async list(signal?: AbortSignal): Promise<ProductListingTemplate[]> {
    const { data } = await apiHttp.get<ProductListingTemplate[]>('/product-listing-template', { signal, showErrorToast: false })
    return data
  },
  async get(id: string, signal?: AbortSignal): Promise<ProductListingTemplate> {
    const { data } = await apiHttp.get<ProductListingTemplate>(`/product-listing-template/${id}`, { signal, showErrorToast: false })
    return data
  },
  async create(input: ProductListingTemplateInput): Promise<ProductListingTemplate> {
    const { data } = await apiHttp.post<ProductListingTemplate>('/product-listing-template', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: ProductListingTemplateInput): Promise<ProductListingTemplate> {
    const { data } = await apiHttp.put<ProductListingTemplate>(`/product-listing-template/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/product-listing-template/${id}`, { showErrorToast: false })
  },
  async placeholders(signal?: AbortSignal): Promise<ListingPlaceholder[]> {
    const { data } = await apiHttp.get<ListingPlaceholder[]>('/product-listing-template/placeholders', { signal, showErrorToast: false })
    return data
  },
  async preview(input: ListingTemplateContent, signal?: AbortSignal): Promise<ListingTemplatePreview> {
    const { data } = await apiHttp.post<ListingTemplatePreview>('/product-listing-template/preview', input, { signal, showErrorToast: false })
    return data
  },
}
