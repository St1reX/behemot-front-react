import axios from 'axios'
import { appConfig } from '@/config/app.config'
import { toast } from '@/lib/toast'
import { normalizeApiError } from './errors'

let sessionExpiredHandler: (() => void) | undefined

export function setSessionExpiredHandler(handler: (() => void) | undefined) {
  sessionExpiredHandler = handler
}

export const apiHttp = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { Accept: 'application/json' },
  timeout: 30_000,
  withCredentials: true,
})

apiHttp.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Aborted React Query requests should not produce errors or notifications.
    if (axios.isCancel(error)) return Promise.reject(error)

    const apiError = normalizeApiError(error)
    const config = axios.isAxiosError(error) ? error.config : undefined
    const sessionExpired = apiError.status === 401 && config?.redirectOnUnauthorized !== false

    if (sessionExpired && sessionExpiredHandler) {
      sessionExpiredHandler()
    } else if (config?.showErrorToast !== false) {
      toast.add({ type: 'error', title: 'Błąd', description: apiError.message })
    }

    return Promise.reject(apiError)
  },
)
