import { setBadge } from '@/utils/extension/setBadge'
import { onExtensionMessage } from '@/messaging/extension'

export default function () {
  onExtensionMessage('bg:setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })
}
