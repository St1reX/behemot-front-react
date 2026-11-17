export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  routerBaseUrl: import.meta.env.BASE_URL,
} as const
