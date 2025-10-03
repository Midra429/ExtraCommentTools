import type { ExtSlot } from '@/core/slots'

import { cn } from '@heroui/react'

import { formatDuration } from '@/utils/format'

export type DurationProps = {
  className?: string
  duration: ExtSlot['info']['duration']
}

export function Duration({ className, duration }: DurationProps) {
  return (
    <div
      className={cn(
        'px-1 py-[1px]',
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
