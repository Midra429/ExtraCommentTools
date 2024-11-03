// import type { StorageItems_v2 } from '@/types/storage'

import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async () => {
  const version = (await storage.get('_version')) ?? 0

  // v3.3.6 -> v4.0.0
  if (version < 1) {
    logger.log('migration: v3.3.6 -> v4.0.0')

    await storage.remove()

    await storage.set('_version', 1)
  }
}
