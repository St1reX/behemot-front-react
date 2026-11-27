import { apiHttp } from '@/api/http'
import { toDownloadedFile, type DownloadedFile } from '@/api/files/download'
import type { BolmaIntegration, BolmaStatusResponse } from '@/types/imports/imports.types'

export const importsApiClient = {
  async getBolmaStatus(signal?: AbortSignal): Promise<BolmaStatusResponse> {
    const { data } = await apiHttp.get<BolmaStatusResponse>('/imports/bolma/status', {
      signal, showErrorToast: false, validateStatus: (status) => status === 200 || status === 503,
    })
    return data
  },

  async getBolmaConfiguration(signal?: AbortSignal): Promise<BolmaIntegration> {
    const { data } = await apiHttp.get<BolmaIntegration>('/imports/bolma/configuration', { signal, showErrorToast: false })
    return data
  },

  async importBolmaProducts(): Promise<DownloadedFile> {
    const response = await apiHttp.post<Blob>('/imports/bolma/products', { confirmed: true }, {
      responseType: 'blob', timeout: 0, showErrorToast: false,
    })
    return toDownloadedFile(response, 'raport_import_bolma.xlsx')
  },

  async downloadLatestBolmaReport(): Promise<DownloadedFile> {
    const response = await apiHttp.get<Blob>('/imports/bolma/products/report/latest', {
      responseType: 'blob', showErrorToast: false,
    })
    return toDownloadedFile(response, 'raport_import_bolma.xlsx')
  },
}
