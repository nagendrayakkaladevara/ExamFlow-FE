import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { APP_NAME } from '@/config/constants'
import { getNavItemsForRole } from '@/config/navigation'
import { useLogoutMutation } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarProvider } from '@/components/ui/sidebar'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function ShellNav({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) return null

  const items = getNavItemsForRole(user.role)

  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          location.pathname === item.href ||
          (item.href !== `/${user.role.toLowerCase()}` &&
            location.pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="size-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const navigate = useNavigate()

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <aside className="hidden w-64 shrink-0 border-r md:flex md:flex-col">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            {APP_NAME}
          </div>
          <ShellNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b px-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-4 py-4 text-left">
                  <SheetTitle>{APP_NAME}</SheetTitle>
                </SheetHeader>
                <ShellNav onNavigate={() => undefined} />
              </SheetContent>
            </Sheet>

            <div className="flex-1 md:hidden font-semibold">{APP_NAME}</div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-auto gap-2 px-2">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm sm:inline">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account/password')}>
                    Change password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </header>

          <Separator className="hidden" />

          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export function ExamLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Outlet />
    </div>
  )
}

export function PublicLayout() {
  return (
    <div className="min-h-svh bg-muted/30">
      <Outlet />
    </div>
  )
}
