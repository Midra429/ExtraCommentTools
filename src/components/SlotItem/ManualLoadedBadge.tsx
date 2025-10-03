import type { ExtSlot } from '@/core/slots'

import { cn } from '@heroui/react'

export type ManualLoadedBadgeProps = {
  className?: string
  isManual: ExtSlot['isManual']
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
