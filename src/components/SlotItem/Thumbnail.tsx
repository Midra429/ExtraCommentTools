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

export const Thumbnail: React.FC<ThumbnailProps> = ({
  type,
  offsetMs,
  isManual,
  info,
  isSearch,
}) => {
  return (
    <>
      <Image
        classNames={{
          wrapper: 'h-full rounded-lg bg-foreground-300 p-[1px]',
          img: 'aspect-video h-full rounded-lg object-cover',
        }}
        src={info.thumbnail}
        draggable={false}
      />

      <div
        className={cn(
          'absolute left-[2px] top-[2px] z-10',
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
        className="absolute bottom-[2px] right-[2px] z-10"
        duration={info.duration}
      />
    </>
  )
}
