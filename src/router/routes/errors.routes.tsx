import type { RouteObject } from 'react-router'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'

export const errorRoutes: RouteObject[] = [
  { path: '/forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]
