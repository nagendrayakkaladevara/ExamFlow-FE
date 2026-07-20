import { useLocation } from 'react-router-dom'

import { APP_NAME } from '@/config/constants'
import { getNavItemsForRole } from '@/config/navigation'
import { useAuthStore } from '@/features/auth/store'
import { InstitutionLogo } from '@/components/layout/institution-logo'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

function getPageTitle(pathname: string): string {
  const user = useAuthStore.getState().user
  if (!user) return APP_NAME

  const items = getNavItemsForRole(user.role)
  const match = items.find(
    (item) =>
      pathname === item.href ||
      (item.href !== `/${user.role.toLowerCase()}` &&
        pathname.startsWith(item.href)),
  )

  if (match) return match.title
  if (pathname === '/account/password') return 'Change password'
  if (pathname === '/account/settings') return 'Settings'
  return APP_NAME
}

export function SiteHeader() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <InstitutionLogo className="ml-auto hidden sm:block" />
      </div>
    </header>
  )
}
