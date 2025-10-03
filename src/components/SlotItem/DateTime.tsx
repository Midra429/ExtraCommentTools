import type { ExtSlot } from '@/core/slots'

import { cn } from '@heroui/react'
import { CalendarDaysIcon } from 'lucide-react'

import { formatDate } from '@/utils/format'

export type DateTimeProps = {
  date: ExtSlot['info']['date']
  isSearch?: boolean
}

export function DateTime({ date, isSearch }: DateTimeProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-row items-center gap-1',
        'text-foreground-500 dark:text-foreground-600'
      )}
    >
      <CalendarDaysIcon className={isSearch ? 'size-mini' : 'size-tiny'} />
      <span className={isSearch ? 'text-mini' : 'text-tiny'}>
        {formatDate(date, 'YYYY/MM/DD(d) hh:mm')}
      </span>
    </div>
  )
}
