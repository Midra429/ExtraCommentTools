import { useSlots } from '@/hooks/useSlots'
import { cn } from '@heroui/react'

import { SlotItem } from '@/components/SlotItem'

export function Body() {
  const slots = useSlots()

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
          <span className="text-foreground-500 text-small">
            コメントはありません
          </span>
        </div>
      )}
    </div>
  )
}
