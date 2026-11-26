import type { RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
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
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT}:${ACTIONS.READ}`} />,
            children: [
              { path: '/products', lazy: async () => ({ Component: (await import('@/pages/products/ProductsPage')).ProductsPage }) },
              { path: '/products/:id', lazy: async () => ({ Component: (await import('@/pages/products/ProductDetailsPage')).ProductDetailsPage }) },
              {
                element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT}:${ACTIONS.UPDATE}`} />,
                children: [{ path: '/products/:id/edit', lazy: async () => ({ Component: (await import('@/pages/products/ProductEditorPage')).ProductEditorPage }) }],
              },
            ],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT}:${ACTIONS.CREATE}`} />,
            children: [{ path: '/products/new', lazy: async () => ({ Component: (await import('@/pages/products/ProductEditorPage')).ProductEditorPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.INTEGRATION}:${ACTIONS.READ}`} />,
            children: [{ path: '/integrations', lazy: async () => ({ Component: (await import('@/pages/integrations/IntegrationsPage')).IntegrationsPage }) }],
          },
          { path: '/', lazy: async () => ({ Component: (await import('@/pages/home/HomePage')).HomePage }) },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.USER}:${ACTIONS.READ}`} />,
            children: [{ path: '/users', lazy: async () => ({ Component: (await import('@/pages/users/UsersPage')).UsersPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.ROLE}:${ACTIONS.READ}`} />,
            children: [{ path: '/roles', lazy: async () => ({ Component: (await import('@/pages/roles/RolesPage')).RolesPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.AUDIT_LOG}:${ACTIONS.READ}`} />,
            children: [{ path: '/audit-logs', lazy: async () => ({ Component: (await import('@/pages/audit-logs/AuditLogsPage')).AuditLogsPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`} />,
            children: [{ path: '/vehicles', lazy: async () => ({ Component: (await import('@/pages/vehicles/VehiclesPage')).VehiclesPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.CONTRACTOR}:${ACTIONS.READ}`} />,
            children: [{ path: '/contractors', lazy: async () => ({ Component: (await import('@/pages/contractors/ContractorsPage')).ContractorsPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCER}:${ACTIONS.READ}`} />,
            children: [{ path: '/producers', lazy: async () => ({ Component: (await import('@/pages/producers/ProducersPage')).ProducersPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.DEPARTMENT}:${ACTIONS.READ}`} />,
            children: [{ path: '/departments', lazy: async () => ({ Component: (await import('@/pages/departments/DepartmentsPage')).DepartmentsPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.WAREHOUSE}:${ACTIONS.READ}`} />,
            children: [{ path: '/warehouses', lazy: async () => ({ Component: (await import('@/pages/warehouses/WarehousesPage')).WarehousesPage }) }],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.READ}`} />,
            children: [
              { path: '/listing-templates', lazy: async () => ({ Component: (await import('@/pages/product-listing-templates/ProductListingTemplatesPage')).ProductListingTemplatesPage }) },
              { path: '/listing-templates/:id', lazy: async () => ({ Component: (await import('@/pages/product-listing-templates/ProductListingTemplateEditorPage')).ProductListingTemplateEditorPage }) },
            ],
          },
          {
            element: <RequirePrivilege requiredPrivileges={`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.CREATE}`} />,
            children: [{ path: '/listing-templates/new', lazy: async () => ({ Component: (await import('@/pages/product-listing-templates/ProductListingTemplateEditorPage')).ProductListingTemplateEditorPage }) }],
          },
        ],
      },
    ],
  },
]
