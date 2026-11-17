import type { RouteObject } from 'react-router'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RequireGuest } from '../guards'

export const authRoutes: RouteObject[] = [
  {
    element: <RequireGuest />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
]
