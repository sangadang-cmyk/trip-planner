import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AuthBackButtonProps = {
  className?: string
}

export function AuthBackButton({ className }: AuthBackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-2 gap-1.5 text-muted-foreground hover:text-foreground',
        className,
      )}
      render={<Link to="/" />}
    >
      <ArrowLeftIcon />
      Back
    </Button>
  )
}
