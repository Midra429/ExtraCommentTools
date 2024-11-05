import { utilsMessagingExtension } from '@/utils/messaging/extension'
import { utilsMessagingPage } from '@/utils/messaging/page'

export default () => {
  utilsMessagingPage.onMessage('getCurrentTab', ({ data }) => {
    return utilsMessagingExtension.sendMessage('getCurrentTab', data)
  })

  utilsMessagingPage.onMessage('setBadge', ({ data }) => {
    return utilsMessagingExtension.sendMessage('setBadge', data)
  })
}
