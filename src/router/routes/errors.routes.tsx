import type { RouteObject } from 'react-router'

export const errorRoutes: RouteObject[] = [
  { path: '/forbidden', lazy: async () => ({ Component: (await import('@/pages/errors/ForbiddenPage')).ForbiddenPage }) },
  { path: '*', lazy: async () => ({ Component: (await import('@/pages/errors/NotFoundPage')).NotFoundPage }) },
]
