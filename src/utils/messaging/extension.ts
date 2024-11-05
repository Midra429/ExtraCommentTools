import type { Tabs } from 'wxt/browser'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

export type ProtocolMap = {
  getCurrentTab: (args?: null) => Tabs.Tab

  setBadge: (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
}

export const utilsMessagingExtension = defineExtensionMessaging<ProtocolMap>()
