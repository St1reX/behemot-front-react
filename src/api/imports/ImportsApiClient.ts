import { apiHttp } from '@/api/http'
import type { BolmaIntegration, BolmaStatusResponse } from '@/types/imports/imports.types'

function saveReport(blob: Blob, importId: string, disposition: unknown) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const serverFilename = typeof disposition === 'string' ? /filename="([^"]+)"/.exec(disposition)?.[1] : undefined
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date())
  link.download = serverFilename ?? `raport_import_bolma_${date}_${importId.slice(0, 8)}.xlsx`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

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

  async importBolmaProducts(importId: string): Promise<void> {
    const { data, headers } = await apiHttp.post<Blob>('/imports/bolma/products', { importId, confirmed: true }, {
      responseType: 'blob', timeout: 0, showErrorToast: false,
    })
    saveReport(data, importId, headers['content-disposition'])
  },

  async downloadBolmaReport(importId: string): Promise<void> {
    const { data, headers } = await apiHttp.get<Blob>(`/imports/bolma/products/${importId}/report`, {
      responseType: 'blob', showErrorToast: false,
    })
    saveReport(data, importId, headers['content-disposition'])
  },
}
