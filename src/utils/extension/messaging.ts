import type { Tabs } from 'wxt/browser'
import type { setBadge } from './setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

type ProtocolMap = {
  getCurrentTab: (args?: null) => Tabs.Tab

  setBadge: (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
}

export const utilsMessenger = defineExtensionMessaging<ProtocolMap>()

export const sendUtilsMessage = utilsMessenger.sendMessage
