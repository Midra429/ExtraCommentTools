import type { GetDataType, GetReturnType } from '@webext-core/messaging'
import type { StorageItems } from '@/types/storage'

import { defineExtensionMessaging } from '@webext-core/messaging'

import { webext } from '@/utils/webext'

type ProtocolMap = {
  getVideoId: (args?: null) => string | null

  capture: (format: StorageItems['settings:capture:format']) => {
    format: 'jpeg' | 'png'
    data?: number[]
  }
}

export const extMessaging = defineExtensionMessaging<ProtocolMap>()

export const sendExtMessage = async <TType extends keyof ProtocolMap>(
  type: TType,
  data: GetDataType<ProtocolMap[TType]>,
  tabId?: number
): Promise<GetReturnType<ProtocolMap[TType]> | null> => {
  if (typeof tabId === 'undefined') {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  try {
    return await extMessaging.sendMessage(type, data, tabId)
  } catch {
    return null
  }
}
