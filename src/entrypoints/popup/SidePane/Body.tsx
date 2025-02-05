import { memo } from 'react'

import { useExtSlots } from '@/hooks/useExtSlots'
import { cn } from '@heroui/react'

import { SlotItem } from '@/components/SlotItem'

export const Body: React.FC = memo(() => {
  const slots = useExtSlots()

  return (
    <div className="relative size-full overflow-y-auto p-2">
      {slots?.length ? (
        <div className="flex flex-col gap-2">
          {slots.map((slot) => (
            <SlotItem key={slot.id} slot={slot} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'absolute inset-0 z-20',
            'flex size-full flex-col items-center justify-center gap-3'
          )}
        >
          <span className="text-small text-foreground-500">
            コメントはありません
          </span>
        </div>
      )}
    </div>
  )
})
