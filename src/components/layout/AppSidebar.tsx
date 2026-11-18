import { CarFront, LayoutDashboard, LogOut, UserRound } from 'lucide-react'
import { Link, NavLink, useMatch } from 'react-router'
import behemotLogo from '@/assets/images/behemot-logo.jpeg'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLogout } from '@/hooks/useLogout'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/auth.store'

export function AppSidebar() {
  const username = useAuthStore((state) => state.user?.username)
  const logout = useLogout()
  const isHomePage = Boolean(useMatch({ path: '/', end: true }))
  const isVehiclesPage = Boolean(useMatch({ path: '/vehicles', end: false }))
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" aria-label="Nawigacja panelu">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/" onClick={() => setOpenMobile(false)} />}
              aria-label="Behemot — pulpit"
              className="gap-3"
            >
              <img
                src={behemotLogo}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
              />
              <div className="grid min-w-0 gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="truncate text-base font-semibold">Behemot</span>
                <span className="text-xs text-muted-foreground">Panel zarządzania</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<NavLink to="/" end onClick={() => setOpenMobile(false)} />}
                  isActive={isHomePage}
                  tooltip="Pulpit"
                  aria-label="Pulpit"
                >
                  <LayoutDashboard aria-hidden="true" />
                  <span>Pulpit</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<NavLink to="/vehicles" onClick={() => setOpenMobile(false)} />}
                  isActive={isVehiclesPage}
                  tooltip="Pojazdy"
                  aria-label="Pojazdy"
                >
                  <CarFront aria-hidden="true" />
                  <span>Pojazdy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex min-w-0 items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <UserRound aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm group-data-[collapsible=icon]:sr-only">{username}</span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip="Wyloguj się"
              aria-label={logout.isPending ? 'Wylogowywanie…' : 'Wyloguj się'}
              disabled={logout.isPending}
              onClick={() => logout.mutate(undefined, {
                onError: () => toast.add({
                  type: 'error',
                  title: 'Nie udało się wylogować.',
                  description: 'Spróbuj ponownie.',
                }),
              })}
            >
              <LogOut aria-hidden="true" />
              <span>{logout.isPending ? 'Wylogowywanie…' : 'Wyloguj się'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
