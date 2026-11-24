import type { RouteObject } from 'react-router'
import { RequireGuest } from '../guards'

export const authRoutes: RouteObject[] = [
  { path: '/verify-account', lazy: async () => ({ Component: (await import('@/pages/auth/VerifyAccountPage')).VerifyAccountPage }) },
  {
    element: <RequireGuest />,
    children: [
      { path: '/login', lazy: async () => ({ Component: (await import('@/pages/auth/LoginPage')).LoginPage }) },
      { path: '/register', lazy: async () => ({ Component: (await import('@/pages/auth/RegisterPage')).RegisterPage }) },
    ],
  },
]
