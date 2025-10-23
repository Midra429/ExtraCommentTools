import type { Slot } from '@/core/slots'

import { useSlotsManager, useSlots } from '@/hooks/useSlots'

import { SlotItem } from '@/components/SlotItem'

export interface NiconicoResultsProps {
  results: Slot[]
}

export function Results({ results }: NiconicoResultsProps) {
  const slotsManager = useSlotsManager()
  const slots = useSlots()

  const ids = [slotsManager?.id, slots?.map((v) => v.id)]
    .filter((v) => v != null)
    .flat()

  return (
    <div className="flex flex-col gap-2">
      {results.map((slot) => (
        <SlotItem
          key={slot.id}
          slot={slot}
          isSearch
          isDisabled={ids.includes(slot.id)}
        />
      ))}
    </div>
  )
}
