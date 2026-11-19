import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useLogout } from '@/hooks/useLogout'
import { useAuthStore } from '@/stores/auth.store'

export function SidebarUserMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const { isMobile } = useSidebar()
  const [profileOpen, setProfileOpen] = useState(false)

  if (!user) return null

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="gap-3 data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />} aria-label={`Menu użytkownika ${user.username}`} disabled={logout.isPending}>
              <Avatar className="rounded-lg after:rounded-lg">
                {user.profilePictureUrl && <AvatarImage src={user.profilePictureUrl} alt="" className="rounded-lg" />}
                <AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary">{user.username.slice(0, 2).toLocaleUpperCase('pl-PL')}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 gap-0.5 text-left group-data-[collapsible=icon]:hidden"><span className="truncate text-sm font-semibold">{user.username}</span><span className="truncate text-xs text-muted-foreground">{user.email}</span></div>
              <ChevronsUpDown aria-hidden="true" className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side={isMobile ? 'top' : 'right'} align="end" sideOffset={8} className="w-64 max-w-[calc(100vw-2rem)] rounded-xl font-sans">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-3"><span className="block truncate text-sm font-semibold text-foreground">{user.username}</span><span className="mt-1 block truncate text-xs font-normal">{user.email}</span></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-3 py-2" onClick={() => setProfileOpen(true)}><UserRound aria-hidden="true" />Moje konto</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2 px-3 py-2" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut aria-hidden="true" />{logout.isPending ? 'Wylogowywanie…' : 'Wyloguj się'}</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {logout.isError && <p role="alert" className="px-2 py-1 text-xs text-destructive">{logout.error.message}</p>}
          {logout.isPending && <span role="status" className="sr-only">Wylogowywanie…</span>}
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader><DialogTitle>Moje konto</DialogTitle><DialogDescription>Dane aktualnie zalogowanego użytkownika.</DialogDescription></DialogHeader>
          <dl className="grid gap-4 rounded-lg border bg-muted/20 p-4 text-sm [&_dt]:mb-1 [&_dt]:text-xs [&_dt]:text-muted-foreground [&_dd]:wrap-anywhere">
            <div><dt>Nazwa użytkownika</dt><dd className="font-medium">{user.username}</dd></div>
            <div><dt>Adres e-mail</dt><dd>{user.email}</dd></div>
            <div><dt>Rola</dt><dd>{user.role.name}</dd></div>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  )
}
