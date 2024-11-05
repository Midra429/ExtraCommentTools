import type { ProtocolMap } from './extension'

import { defineWindowMessaging } from '@webext-core/messaging/page'

// content (MAIN) -> content

export const utilsMessagingPage = defineWindowMessaging<ProtocolMap>({
  namespace: `${EXT_BUILD_ID}:utilsMessaging`,
})
