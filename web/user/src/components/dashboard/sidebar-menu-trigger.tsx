import { MenuIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const sidebarMenuTriggerClassName = cn(
  'size-10 shrink-0 shadow-lg',
  'ring-2 ring-primary/30 hover:ring-primary/50',
)

type SidebarMenuTriggerProps = React.ComponentProps<typeof Button>

export function SidebarMenuTrigger({
  className,
  onClick,
  ...props
}: SidebarMenuTriggerProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="default"
      size="icon"
      aria-label="Open menu"
      className={cn(sidebarMenuTriggerClassName, className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <MenuIcon />
    </Button>
  )
}
