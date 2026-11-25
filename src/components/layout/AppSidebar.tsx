import { CarFront, Factory, FileText, Handshake, History, LayoutDashboard, Network, Package, ShieldCheck, Users, Warehouse } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'
import behemotLogo from '@/assets/images/behemot-logo.jpeg'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail, SidebarSeparator, useSidebar,
} from '@/components/ui/sidebar'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { Privilege } from '@/shared/constants/privileges'
import { SidebarUserMenu } from './SidebarUserMenu'

const navigationGroups: { label: string; items: { title: string; to: string; icon: LucideIcon; privilege?: Privilege }[] }[] = [
  {
    label: 'Przegląd',
    items: [
      { title: 'Pulpit', to: '/', icon: LayoutDashboard },
      { title: 'Logi audytowe', to: '/audit-logs', icon: History, privilege: `${ENTITIES.AUDIT_LOG}:${ACTIONS.READ}` },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { title: 'Produkty', to: '/products', icon: Package, privilege: `${ENTITIES.PRODUCT}:${ACTIONS.READ}` },
      { title: 'Pojazdy', to: '/vehicles', icon: CarFront, privilege: `${ENTITIES.CAR_BRAND}:${ACTIONS.READ}` },
      { title: 'Kontrahenci', to: '/contractors', icon: Handshake, privilege: `${ENTITIES.CONTRACTOR}:${ACTIONS.READ}` },
      { title: 'Producenci', to: '/producers', icon: Factory, privilege: `${ENTITIES.PRODUCER}:${ACTIONS.READ}` },
      { title: 'Magazyny', to: '/warehouses', icon: Warehouse, privilege: `${ENTITIES.WAREHOUSE}:${ACTIONS.READ}` },
    ],
  },
  {
    label: 'Administracja',
    items: [
      { title: 'Szablony ogłoszeń', to: '/listing-templates', icon: FileText, privilege: `${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.READ}` },
      { title: 'Działy', to: '/departments', icon: Network, privilege: `${ENTITIES.DEPARTMENT}:${ACTIONS.READ}` },
      { title: 'Role i uprawnienia', to: '/roles', icon: ShieldCheck, privilege: `${ENTITIES.ROLE}:${ACTIONS.READ}` },
      { title: 'Użytkownicy', to: '/users', icon: Users, privilege: `${ENTITIES.USER}:${ACTIONS.READ}` },
    ],
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { requirePrivilege } = useAccess()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" aria-label="Nawigacja panelu">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" onClick={() => setOpenMobile(false)} />} aria-label="Behemot — pulpit" className="gap-3">
              <img src={behemotLogo} alt="" width={32} height={32} className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10" />
              <div className="grid min-w-0 gap-0.5 group-data-[collapsible=icon]:hidden"><span className="truncate text-base font-semibold">Behemot</span><span className="text-xs text-muted-foreground">Panel zarządzania</span></div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="gap-2">
        {navigationGroups.map((group) => {
          const items = group.items.filter((item) => !item.privilege || requirePrivilege(item.privilege))
          if (items.length === 0) return null
          return (
            <SidebarGroup key={group.label} className="border-b border-sidebar-border pb-4 last:border-b-0">
              <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider uppercase">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        render={<NavLink to={item.to} end={item.to === '/'} onClick={() => setOpenMobile(false)} />}
                        isActive={pathname === item.to || (item.to !== '/' && pathname.startsWith(`${item.to}/`))}
                        tooltip={item.title}
                        aria-label={item.title}
                      >
                        <item.icon aria-hidden="true" /><span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
