import { utilsMessagingExtension } from '@/utils/messaging/extension'
import { setBadge } from '@/utils/extension/setBadge'

export default function () {
  utilsMessagingExtension.onMessage('getCurrentTab', ({ sender }) => {
    return sender.tab
  })

  utilsMessagingExtension.onMessage('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })
}
