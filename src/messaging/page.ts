import type { setBadge } from '@/utils/extension/setBadge'

import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export interface ProtocolMap {
  // page -> content
  'content:setBadge': (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
}

export const { sendMessage: sendPageMessage, onMessage: onPageMessage } =
  defineCustomEventMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:page`,
  })
