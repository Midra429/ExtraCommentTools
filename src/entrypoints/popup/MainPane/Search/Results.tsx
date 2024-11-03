import type { ExtSlot } from '@/core/slots'

import { useMemo } from 'react'

import { slotsManager, useExtSlots } from '@/hooks/useExtSlots'

import { SlotItem } from '@/components/SlotItem'

export type NiconicoResultsProps = {
  slots: ExtSlot[]
}

export const Results: React.FC<NiconicoResultsProps> = ({ slots }) => {
  const extSlots = useExtSlots()

  const extSlotIds = useMemo(() => {
    const ids = extSlots?.map((v) => v.id) ?? []

    if (slotsManager) {
      ids.push(slotsManager.id)
    }

    return ids
  }, [extSlots])

  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <SlotItem
          key={slot.id}
          slot={slot}
          isSearch
          isDisabled={extSlotIds.includes(slot.id)}
        />
      ))}
    </div>
  )
}
