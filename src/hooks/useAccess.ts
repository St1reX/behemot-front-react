import { useAuthStore } from '@/stores/auth.store'
import type { Privilege } from '@/shared/constants/privileges'

export function useAccess() {
  const user = useAuthStore((state) => state.user)

  function requireRole(allowedRoles: string | readonly string[]): boolean {
    if (!user?.isActive) {
      return false
    }

    const roles = typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles
    return roles.includes(user.role.name)
  }

  function requirePrivilege(requiredPrivileges: Privilege | readonly Privilege[]): boolean {
    if (!user?.isActive) {
      return false
    }

    const privileges: readonly string[] = typeof requiredPrivileges === 'string'
      ? [requiredPrivileges]
      : requiredPrivileges

    // Tak jak w backendzie wystarczy jedno z wymaganych uprawnien.
    return user.role.privileges.some((privilege) => privileges.includes(privilege.name))
  }

  return { requireRole, requirePrivilege }
}
