import { BrowserRouter, useRoutes } from 'react-router'
import { appConfig } from '@/config/app.config'
import { authRoutes } from './routes/auth.routes'
import { errorRoutes } from './routes/errors.routes'
import { generalRoutes } from './routes/general.routes'

const routes = [...generalRoutes, ...authRoutes, ...errorRoutes]

function AppRoutes() {
  return useRoutes(routes)
}

export function AppRouter() {
  return (
    <BrowserRouter basename={appConfig.routerBaseUrl}>
      <AppRoutes />
    </BrowserRouter>
  )
}
