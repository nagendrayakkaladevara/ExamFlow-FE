import { Link } from 'react-router-dom'
import { CirclePlus, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavActions({ quickCreateHref }: { quickCreateHref: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2">
        <SidebarMenuButton
          asChild
          tooltip="Quick Create"
          className="min-w-8 flex-1 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
        >
          <Link to={quickCreateHref}>
            <CirclePlus />
            <span>Quick Create</span>
          </Link>
        </SidebarMenuButton>
        <Button
          size="icon"
          className="size-8 shrink-0 group-data-[collapsible=icon]:opacity-0"
          variant="outline"
        >
          <Mail />
          <span className="sr-only">Inbox</span>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
