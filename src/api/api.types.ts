import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Disable when the caller displays the error inline. */
    showErrorToast?: boolean
    /** Disable for requests where 401 does not mean an expired application session. */
    redirectOnUnauthorized?: boolean
  }
}

export interface ApiValidationIssue {
  path: string
  message: string
  code: string
}
