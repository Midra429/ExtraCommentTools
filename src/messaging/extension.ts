import type { setBadge } from '@/utils/extension/setBadge'

import { defineMessaging } from '@/utils/messaging'

export interface ProtocolMap {
  // background -> content
  'content:getVideoId': (args?: null) => string | null

  // content -> background
  'bg:setBadge': (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
}

export const {
  sendMessage: sendExtensionMessage,
  onMessage: onExtensionMessage,
} = defineMessaging<ProtocolMap>()
