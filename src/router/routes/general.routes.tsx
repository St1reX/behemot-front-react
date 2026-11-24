import type { RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/home/HomePage'
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage'
import { ContractorsPage } from '@/pages/contractors/ContractorsPage'
import { ProducersPage } from '@/pages/producers/ProducersPage'
import { ProductListingTemplatesPage } from '@/pages/product-listing-templates/ProductListingTemplatesPage'
import { ProductListingTemplateEditorPage } from '@/pages/product-listing-templates/ProductListingTemplateEditorPage'
import { VehiclesPage } from '@/pages/vehicles/VehiclesPage'
import { WarehousesPage } from '@/pages/warehouses/WarehousesPage'
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
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.AUDIT_LOG}:${ACTIONS.READ}`} />,
            children: [{ path: '/audit-logs', element: <AuditLogsPage /> }],
          },
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
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.WAREHOUSE}:${ACTIONS.READ}`} />,
            children: [{ path: '/warehouses', element: <WarehousesPage /> }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.READ}`} />,
            children: [
              { path: '/listing-templates', element: <ProductListingTemplatesPage /> },
              { path: '/listing-templates/:id', element: <ProductListingTemplateEditorPage /> },
            ],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.CREATE}`} />,
            children: [{ path: '/listing-templates/new', element: <ProductListingTemplateEditorPage /> }],
          },
        ],
      },
    ],
  },
]
