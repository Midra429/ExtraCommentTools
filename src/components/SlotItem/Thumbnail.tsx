import type { Slot } from '@/core/slots'

import { Image, cn } from '@heroui/react'

import { SourceBadge } from './SourceBadge'
import { ManualLoadedBadge } from './ManualLoadedBadge'
import { Offset } from './Offset'
import { Duration } from './Duration'

export interface ThumbnailProps {
  type: Slot['type']
  offsetMs: Slot['offsetMs']
  isManual: Slot['isManual']
  info: Slot['info']
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
          wrapper: 'h-full rounded-lg bg-foreground-300 p-px',
          img: 'aspect-video h-full rounded-lg object-cover',
        }}
        src={info.thumbnail}
        draggable={false}
      />

      <div
        className={cn(
          'absolute top-0.5 left-0.5 z-10',
          'flex flex-col items-start gap-px'
        )}
      >
        {/* ソース */}
        <SourceBadge type={type} />

        {/* 自動 / 手動 */}
        {!isSearch && <ManualLoadedBadge isManual={isManual} />}
      </div>

      {/* オフセット */}
      <Offset
        className="absolute bottom-0.5 left-0.5 z-10"
        offsetMs={offsetMs}
      />

      {/* 長さ */}
      <Duration
        className="absolute right-0.5 bottom-0.5 z-10"
        duration={info.duration}
      />
    </>
  )
}
