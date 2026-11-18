import type { RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/home/HomePage'
import { ContractorsPage } from '@/pages/contractors/ContractorsPage'
import { ProducersPage } from '@/pages/producers/ProducersPage'
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
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.CONTRACTOR}:${ACTIONS.READ}`} />,
            children: [{ path: '/contractors', element: <ContractorsPage /> }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCER}:${ACTIONS.READ}`} />,
            children: [{ path: '/producers', element: <ProducersPage /> }],
          },
        ],
      },
    ],
  },
]
