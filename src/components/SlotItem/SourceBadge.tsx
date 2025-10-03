import type { ExtSlot } from '@/core/slots'

import { cn } from '@heroui/react'

export type SourceTagProps = {
  className?: string
  type: ExtSlot['type']
}

const SOURCE_BADGE_CLASSES: {
  [key in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: cn('bg-[#ffe248] text-black dark:bg-[#ffd700]'),
  danime: cn('bg-danime-400 dark:bg-danime-500 text-white'),
}

const SOURCE_BADGE_NAME: {
  [key in Exclude<SourceTagProps['type'], 'normal'>]: string
} = {
  official: '公式',
  danime: 'dアニメ',
}

export function SourceBadge({ className, type }: SourceTagProps) {
  if (type === 'normal') return

  return (
    <div
      className={cn(
        'px-1 py-[1px]',
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
