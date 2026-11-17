import type { RouteObject } from 'react-router'
import { HomePage } from '@/pages/home/HomePage'
import { RequireAuth } from '../guards'

export const generalRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <HomePage /> }],
  },
]
