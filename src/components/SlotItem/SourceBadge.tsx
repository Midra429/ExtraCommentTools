import type { Slot } from '@/core/slots'

import { cn } from '@heroui/react'

export interface SourceTagProps {
  className?: string
  type: Slot['type']
}

type SourceBadgeKey = Exclude<SourceTagProps['type'], 'normal'>

const SOURCE_BADGE_CLASSES: {
  [P in SourceBadgeKey]: string | undefined
} = {
  official: cn('bg-[#ffe248] text-black dark:bg-[#ffd700]'),
  danime: cn('bg-danime-400 text-white dark:bg-danime-500'),
}

const SOURCE_BADGE_NAME: {
  [P in SourceBadgeKey]: string
} = {
  official: '公式',
  danime: 'dアニメ',
}

export function SourceBadge({ className, type }: SourceTagProps) {
  if (type === 'normal') return

  return (
    <div
      className={cn(
        'px-1 py-px',
        'border-1 border-white/80',
        'rounded-md',
        'text-mini',
        'select-none',
        SOURCE_BADGE_CLASSES[type],
        className
      )}
    >
      {SOURCE_BADGE_NAME[type]}
    </div>
  )
}
