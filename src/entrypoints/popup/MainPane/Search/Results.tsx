import type { ExtSlot } from '@/core/slots'

import { slotsManager, useExtSlots } from '@/hooks/useExtSlots'

import { SlotItem } from '@/components/SlotItem'

export type NiconicoResultsProps = {
  slots: ExtSlot[]
}

export function Results({ slots }: NiconicoResultsProps) {
  const extSlots = useExtSlots()

  const ids = extSlots
    ?.map((v) => v.id)
    .concat(slotsManager ? slotsManager.id : [])

  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <SlotItem
          key={slot.id}
          slot={slot}
          isSearch
          isDisabled={ids?.includes(slot.id)}
        />
      ))}
    </div>
  )
}
