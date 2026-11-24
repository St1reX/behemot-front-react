import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { appConfig } from '@/config/app.config'
import { authRoutes } from './routes/auth.routes'
import { errorRoutes } from './routes/errors.routes'
import { generalRoutes } from './routes/general.routes'

const router = createBrowserRouter([...generalRoutes, ...authRoutes, ...errorRoutes], {
  basename: appConfig.routerBaseUrl,
})

export function AppRouter() {
  return <RouterProvider router={router} />
}
