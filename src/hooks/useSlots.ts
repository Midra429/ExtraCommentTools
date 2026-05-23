import type { Slot } from '@/core/slots'

import { useEffect, useState } from 'react'

import { SlotsManager } from '@/core/slots'
import { storage } from '@/utils/storage/extension'
import { sendExtensionMessage } from '@/messaging/extension'

let _slotsManager: SlotsManager | null = null

export function useSlotsManager(tabId?: number) {
  const [slotsManager, setSlotsManager] = useState<SlotsManager | null>(
    _slotsManager
  )

  useEffect(() => {
    if (_slotsManager) return

    sendExtensionMessage('content:getVideoId', null, tabId).then((videoId) => {
      _slotsManager = videoId ? new SlotsManager(videoId, storage) : null

      setSlotsManager(_slotsManager)
    })
  }, [])

  return slotsManager
}

export function useSlots(): Slot[] | null {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const slotsManager = useSlotsManager()

  useEffect(() => {
    if (!slotsManager) return

    slotsManager.get().then(setSlots)

    return slotsManager.onChange(setSlots)
  }, [slotsManager])

  return slots
}
