import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ResizableSplitPaneProps = {
  left: ReactNode
  right: ReactNode
  className?: string
  defaultRightWidth?: number
  minLeftWidth?: number
  minRightWidth?: number
}

function useLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    function handleChange() {
      setIsLargeScreen(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isLargeScreen
}

export function ResizableSplitPane({
  left,
  right,
  className,
  defaultRightWidth = 448,
  minLeftWidth = 280,
  minRightWidth = 320,
}: ResizableSplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rightWidth, setRightWidth] = useState(defaultRightWidth)
  const isDraggingRef = useRef(false)
  const isLargeScreen = useLargeScreen()

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!isDraggingRef.current || !containerRef.current) {
        return
      }

      const bounds = containerRef.current.getBoundingClientRect()
      const nextWidth = bounds.right - event.clientX
      const maxWidth = bounds.width - minLeftWidth

      setRightWidth(
        Math.min(maxWidth, Math.max(minRightWidth, nextWidth)),
      )
    }

    function handleMouseUp() {
      if (!isDraggingRef.current) {
        return
      }

      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [minLeftWidth, minRightWidth])

  function handleDragStart() {
    isDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      ref={containerRef}
      className={cn('flex min-h-0 flex-1 flex-col lg:flex-row', className)}
    >
      <div className="min-h-0 min-w-0 flex-1">{left}</div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        onMouseDown={handleDragStart}
        className={cn(
          'relative hidden shrink-0 lg:block',
          'w-px cursor-col-resize bg-border',
          'transition-colors hover:bg-primary/40 active:bg-primary/60',
          'before:absolute before:inset-y-0 before:-left-1.5 before:w-3',
        )}
      />

      <div
        className="relative min-h-[28rem] w-full shrink-0 overflow-hidden border-t bg-muted/10 lg:min-h-0 lg:border-t-0 lg:border-l"
        style={isLargeScreen ? { width: rightWidth } : undefined}
      >
        {right}
      </div>
    </div>
  )
}
