import type { Slot } from '@/core/slots'

import { cn } from '@heroui/react'

import { formatDuration } from '@/utils/format'

export interface DurationProps {
  className?: string
  duration: Slot['info']['duration']
}

export function Duration({ className, duration }: DurationProps) {
  return (
    <div
      className={cn(
        'px-1 py-px',
        'border-1 border-white/25',
        'rounded-md',
        'text-mini',
        'bg-black/50 text-white backdrop-blur-md',
        'select-none',
        className
      )}
    >
      {formatDuration(duration)}
    </div>
  )
}
