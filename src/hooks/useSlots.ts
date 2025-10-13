import type { Slot } from '@/core/slots'

import { useEffect, useState } from 'react'

import { storage } from '@/utils/storage/extension'

import { SlotsManager } from '@/core/slots'
import { sendExtMessage } from '@/core/messaging'

let _slotsManager: SlotsManager | null = null

export function useSlotsManager(tabId?: number) {
  const [slotsManager, setSlotsManager] = useState<SlotsManager | null>(
    _slotsManager
  )

  useEffect(() => {
    if (_slotsManager) return

    sendExtMessage('getVideoId', null, tabId).then((videoId) => {
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
