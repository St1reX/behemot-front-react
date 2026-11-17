import type { RouteObject } from 'react-router'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

export const errorRoutes: RouteObject[] = [
  { path: '*', element: <NotFoundPage /> },
]
