import type { ExtSlot } from '@/core/slots'

import { Link, cn } from '@heroui/react'
import { useOverflowDetector } from 'react-detectable-overflow'

export type TitleProps = {
  id: ExtSlot['id']
  title: ExtSlot['info']['title']
  isSearch?: boolean
}

export function Title({ id, title, isSearch }: TitleProps) {
  const { ref, overflow } = useOverflowDetector()

  const element = (
    <span
      className={cn(
        'line-clamp-3 font-semibold break-all whitespace-pre-wrap',
        isSearch ? 'text-mini' : 'text-tiny'
      )}
      title={overflow ? title : undefined}
      ref={ref}
    >
      {title}
    </span>
  )

  return (
    <div className="flex h-full flex-col justify-start">
      {isSearch ? (
        element
      ) : (
        <Link
          color="foreground"
          href={`https://www.nicovideo.jp/watch/${id}`}
          isExternal
        >
          {element}
        </Link>
      )}
    </div>
  )
}
