import type { ProtocolMap } from '..'

import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export const { onMessage, sendMessage } =
  defineCustomEventMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:proxy-service`,
  })
