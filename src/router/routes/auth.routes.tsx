import type { RouteObject } from 'react-router'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyAccountPage } from '@/pages/auth/VerifyAccountPage'
import { RequireGuest } from '../guards'

export const authRoutes: RouteObject[] = [
  { path: '/verify-account', element: <VerifyAccountPage /> },
  {
    element: <RequireGuest />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
]
