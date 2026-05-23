import { extractVideoId } from '@/utils/api/extractVideoId'
import { onExtensionMessage, sendExtensionMessage } from '@/messaging/extension'
import { onPageMessage } from '@/messaging/page'

export default function () {
  onExtensionMessage('content:getVideoId', () => {
    return extractVideoId(location.href)
  })

  onPageMessage('content:setBadge', ({ data }) => {
    return sendExtensionMessage('bg:setBadge', data)
  })
}
