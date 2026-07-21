import type { CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { InstitutionLogo } from '@/components/layout/institution-logo'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export function AppShell() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function ExamLayout() {
  return (
    <div className="relative min-h-svh bg-background">
      <InstitutionLogo className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6" />
      <Outlet />
    </div>
  )
}

export function PublicLayout() {
  return (
    <div className="relative min-h-svh">
      <Outlet />
    </div>
  )
}
