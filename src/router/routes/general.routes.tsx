import type { RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/home/HomePage'
import { VehiclesPage } from '@/pages/vehicles/VehiclesPage'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import { RequireAuth, RequirePrivilege } from '../guards'

export const generalRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`} />,
            children: [{ path: '/vehicles', element: <VehiclesPage /> }],
          },
        ],
      },
    ],
  },
]
