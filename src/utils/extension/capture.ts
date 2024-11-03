import type { StorageItems } from '@/types/storage'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { sendExtMessage } from '@/core/messaging'

export const capture = async (): Promise<
  StorageItems['settings:capture:method'] | false
> => {
  const {
    'settings:capture:format': captureFormat,
    'settings:capture:method': captureMethod,
  } = await settings.get('settings:capture:format', 'settings:capture:method')

  const response = await sendExtMessage(
    'capture',
    captureMethod === 'copy' ? 'png' : captureFormat
  )

  if (response?.data) {
    try {
      const blob = new Blob([new Uint8Array(response.data)], {
        type: `image/${response.format}`,
      })

      switch (captureMethod) {
        case 'copy':
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ])

          break

        default:
          await webext.windows.create({
            type: 'popup',
            width: 1280,
            height: 960,
            url: URL.createObjectURL(blob),
          })
      }

      return captureMethod
    } catch (err) {
      logger.error('capture', err)
    }
  }

  return false
}
