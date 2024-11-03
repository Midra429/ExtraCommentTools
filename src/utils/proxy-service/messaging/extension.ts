import type { ProtocolMap } from '..'

import { defineExtensionMessaging } from '@webext-core/messaging'

export const proxyMessaging = defineExtensionMessaging<ProtocolMap>()
