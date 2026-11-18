import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAccess } from '@/hooks/useAccess'
import type { Privilege } from '@/shared/constants/privileges'

export function RequireAuth() {
  const user = useAuthStore((state) => state.user)

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export function RequireGuest() {
  const user = useAuthStore((state) => state.user)

  return user ? <Navigate to="/" replace /> : <Outlet />
}

export function RequireRole({ allowedRoles }: { allowedRoles: string | readonly string[] }) {
  const user = useAuthStore((state) => state.user)
  const { requireRole } = useAccess()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return requireRole(allowedRoles) ? <Outlet /> : <Navigate to="/forbidden" replace />
}

export function RequirePrivilege({
  requiredPrivileges,
}: {
  requiredPrivileges: Privilege | readonly Privilege[]
}) {
  const user = useAuthStore((state) => state.user)
  const { requirePrivilege } = useAccess()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return requirePrivilege(requiredPrivileges) ? <Outlet /> : <Navigate to="/forbidden" replace />
}
