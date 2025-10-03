import type { ExtSlot } from '@/core/slots'

import { useEffect, useState } from 'react'

import { storage } from '@/utils/storage/extension'

import { ExtSlotsManager } from '@/core/slots'
import { sendExtMessage } from '@/core/messaging'

export let slotsManager: ExtSlotsManager | undefined

export async function initializeExtSlots(tabId?: number) {
  const videoId = await sendExtMessage('getVideoId', null, tabId)

  if (videoId) {
    slotsManager = new ExtSlotsManager(videoId, storage)
  }
}

export function useExtSlotsReady(tabId?: number) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (slotsManager) {
      setReady(true)
    } else {
      initializeExtSlots(tabId).then(() => {
        setReady(slotsManager ? true : false)
      })
    }
  }, [])

  return ready
}

export function useExtSlots(): ExtSlot[] | null {
  const [slots, setSlots] = useState<ExtSlot[] | null>(null)

  useEffect(() => {
    if (!slotsManager) return

    slotsManager.get().then(setSlots)

    return slotsManager.onChange(setSlots)
  }, [])

  return slots
}
