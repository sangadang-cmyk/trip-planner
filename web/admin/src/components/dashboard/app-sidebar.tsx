import { Link } from '@tanstack/react-router'
import { GlobeIcon, LayoutDashboardIcon, MapPinIcon, MapPinnedIcon, UsersIcon } from 'lucide-react'

import { NavMain } from '@/components/dashboard/nav-main'
import { NavUser } from '@/components/dashboard/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'Dashboard',
    to: '/dashboard' as const,
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Accounts',
    to: '/dashboard/accounts' as const,
    icon: UsersIcon,
  },
  {
    title: 'Geolocation',
    to: '/dashboard/geolocation' as const,
    icon: GlobeIcon,
  },
  {
    title: 'Locations',
    to: '/dashboard/locations' as const,
    icon: MapPinnedIcon,
  },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/dashboard" />}
            >
              <MapPinIcon className="size-5!" />
              <span className="text-base font-semibold">Trip Planner</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
