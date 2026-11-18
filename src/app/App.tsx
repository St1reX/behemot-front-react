import { AppRouter } from '@/router/AppRouter'
import { AuthSession } from './AuthSession'
import { AppProviders } from './providers/AppProviders'

export default function App() {
  return (
    <AppProviders>
      <AuthSession>
        <AppRouter />
      </AuthSession>
    </AppProviders>
  )
}
