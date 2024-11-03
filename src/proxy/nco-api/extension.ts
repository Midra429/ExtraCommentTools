import type { ncoApi } from '@midra/nco-api'

import { createProxy } from '@/utils/proxy-service/create'
import { proxyMessaging } from '@/utils/proxy-service/messaging/extension'

export const ncoApiProxy = createProxy<typeof ncoApi>(
  'ncoApi',
  proxyMessaging.sendMessage
)
