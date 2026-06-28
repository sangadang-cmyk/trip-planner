import { Link, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  to: '/dashboard' | '/dashboard/accounts' | '/dashboard/geolocation' | '/dashboard/locations'
  icon: LucideIcon
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.to === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/dashboard/'
                : pathname === item.to

            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  render={<Link to={item.to} />}
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
