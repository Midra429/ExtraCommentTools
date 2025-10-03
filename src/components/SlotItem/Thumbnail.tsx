import type { ExtSlot } from '@/core/slots'

import { Image, cn } from '@heroui/react'

import { SourceBadge } from './SourceBadge'
import { ManualLoadedBadge } from './ManualLoadedBadge'
import { Offset } from './Offset'
import { Duration } from './Duration'

export type ThumbnailProps = {
  type: ExtSlot['type']
  offsetMs: ExtSlot['offsetMs']
  isManual: ExtSlot['isManual']
  info: ExtSlot['info']
  isSearch?: boolean
}

export function Thumbnail({
  type,
  offsetMs,
  isManual,
  info,
  isSearch,
}: ThumbnailProps) {
  return (
    <>
      <Image
        classNames={{
          wrapper: 'bg-foreground-300 h-full rounded-lg p-[1px]',
          img: 'aspect-video h-full rounded-lg object-cover',
        }}
        src={info.thumbnail}
        draggable={false}
      />

      <div
        className={cn(
          'absolute top-[2px] left-[2px] z-10',
          'flex flex-col items-start gap-[1px]'
        )}
      >
        {/* ソース */}
        <SourceBadge type={type} />

        {/* 自動 / 手動 */}
        {!isSearch && <ManualLoadedBadge isManual={isManual} />}
      </div>

      {/* オフセット */}
      <Offset
        className="absolute bottom-[2px] left-[2px] z-10"
        offsetMs={offsetMs}
      />

      {/* 長さ */}
      <Duration
        className="absolute right-[2px] bottom-[2px] z-10"
        duration={info.duration}
      />
    </>
  )
}
