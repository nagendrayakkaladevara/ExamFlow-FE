import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, KeyRound } from 'lucide-react'

import { APP_NAME } from '@/config/constants'
import { getNavItemsForRole } from '@/config/navigation'
import { useAuthStore } from '@/features/auth/store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/layout/nav-main'
import { NavSecondary } from '@/components/layout/nav-secondary'
import { NavUser } from '@/components/layout/nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) return null

  const navItems = getNavItemsForRole(user.role).map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    isActive:
      location.pathname === item.href ||
      (item.href !== `/${user.role.toLowerCase()}` &&
        location.pathname.startsWith(item.href)),
  }))

  const secondaryItems = [
    {
      title: 'Change password',
      href: '/account/password',
      icon: KeyRound,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to={navItems[0]?.href ?? '/'}>
                <GraduationCap className="size-5!" />
                <span className="text-base font-semibold">{APP_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={secondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
