import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

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
  useSidebar,
} from '@/components/ui/sidebar'
import { NavActions } from '@/components/layout/nav-actions'
import { NavMain } from '@/components/layout/nav-main'
import { NavUser } from '@/components/layout/nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const { closeMobileSidebar } = useSidebar()

  useEffect(() => {
    closeMobileSidebar()
  }, [location.pathname, closeMobileSidebar])

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

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link
                to={navItems[0]?.href ?? '/'}
                onClick={closeMobileSidebar}
              >
                <GraduationCap className="size-5!" />
                <span className="text-base font-semibold">{APP_NAME}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user.role === 'ADMIN' && (
          <NavActions quickCreateHref="/admin/users/new" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
