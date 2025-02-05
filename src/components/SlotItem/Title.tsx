import type { ExtSlot } from '@/core/slots'

import { Link, cn } from '@heroui/react'
import { useOverflowDetector } from 'react-detectable-overflow'

export type TitleProps = {
  id: ExtSlot['id']
  title: ExtSlot['info']['title']
  isSearch?: boolean
}

export const Title: React.FC<TitleProps> = ({ id, title, isSearch }) => {
  const { ref, overflow } = useOverflowDetector()

  const element = (
    <span
      className={cn(
        'line-clamp-3 whitespace-pre-wrap break-all font-semibold',
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
