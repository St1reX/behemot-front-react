import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { appConfig } from '@/config/app.config'
import { authRoutes } from './routes/auth.routes'
import { errorRoutes } from './routes/errors.routes'
import { generalRoutes } from './routes/general.routes'

function RouterLoading() {
  return <main className="grid min-h-dvh place-content-center"><p role="status">Wczytywanie strony…</p></main>
}

const router = createBrowserRouter([{
  HydrateFallback: RouterLoading,
  children: [...generalRoutes, ...authRoutes, ...errorRoutes],
}], {
  basename: appConfig.routerBaseUrl,
})

export function AppRouter() {
  return <RouterProvider router={router} />
}
