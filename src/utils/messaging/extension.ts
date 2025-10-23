import type { Tabs } from 'webextension-polyfill'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

export interface ProtocolMap {
  getCurrentTab: (args?: null) => Tabs.Tab

  setBadge: (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
}

export const utilsMessagingExtension = defineExtensionMessaging<ProtocolMap>()
