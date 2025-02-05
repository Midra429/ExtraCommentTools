import type { ExtSlot } from '@/core/slots'

import { useMemo } from 'react'
import { cn } from '@heroui/react'
import { PlayIcon, MessageSquareTextIcon, HeartIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

export type CountsProps = {
  count: ExtSlot['info']['count']
  isSearch?: boolean
}

export const Counts: React.FC<CountsProps> = ({ count, isSearch }) => {
  const [showKawaiiPct] = useSettings('settings:showKawaiiPct')

  const kawaiiPct = useMemo(() => {
    if (!showKawaiiPct || !count.kawaii) return

    return Math.round((count.kawaii / count.comment) * 100 * 10) / 10
  }, [showKawaiiPct, count.comment, count.kawaii])

  return (
    <div
      className={cn(
        'flex flex-row gap-3',
        'shrink-0',
        'text-foreground-500 dark:text-foreground-600'
      )}
    >
      {/* 再生数 */}
      <div className="flex flex-row items-center gap-1">
        <PlayIcon className={isSearch ? 'size-mini' : 'size-tiny'} />

        <span className={isSearch ? 'text-mini' : 'text-tiny'}>
          {count.view.toLocaleString('ja-JP')}
        </span>
      </div>

      {/* コメント数 */}
      <div className="flex flex-row items-center gap-1">
        <MessageSquareTextIcon
          className={isSearch ? 'size-mini' : 'size-tiny'}
        />

        <span className={isSearch ? 'text-mini' : 'text-tiny'}>
          {count.comment.toLocaleString('ja-JP')}
        </span>
      </div>

      {/* かわいい率 */}
      {kawaiiPct && (
        <div className="flex flex-row items-center gap-1">
          <HeartIcon className={isSearch ? 'size-mini' : 'size-tiny'} />

          <span className={isSearch ? 'text-mini' : 'text-tiny'}>
            {kawaiiPct}%
          </span>
        </div>
      )}
    </div>
  )
}
