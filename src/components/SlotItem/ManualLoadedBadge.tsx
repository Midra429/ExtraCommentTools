import type { Slot } from '@/core/slots'

import { cn } from '@heroui/react'

export interface ManualLoadedBadgeProps {
  className?: string
  isManual: Slot['isManual']
}

export function ManualLoadedBadge({
  className,
  isManual,
}: ManualLoadedBadgeProps) {
  if (!isManual) return

  return (
    <div
      className={cn(
        'px-1 py-[1px]',
        'border-1 border-gray-800/50',
        'rounded-md',
        'text-mini',
        'bg-gray-100 text-gray-800',
        'select-none',
        className
      )}
    >
      手動
    </div>
  )
}
