import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { extractVideoId } from '@/utils/api/extractVideoId'
import { registerProxy } from '@/utils/proxy-service/register'
import { onMessage } from '@/utils/proxy-service/messaging/page'
import { extMessaging } from '@/core/messaging'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/extension'

import registerStorageMessage from './registerStorageMessage'
import registerUtilsMessage from './registerUtilsMessage'

export default defineContentScript({
  matches: MATCHES,
  runAt: 'document_start',
  main: () => void main(),
})

function main() {
  window.addEventListener('DOMContentLoaded', () => {
    // 動画情報APIが必ず実行されるようにする
    document.querySelector('[name="server-response"]')?.remove()
  })

  registerProxy('ncoApi', ncoApiProxy, onMessage)
  registerProxy('ncoSearch', ncoSearchProxy, onMessage)

  registerStorageMessage()
  registerUtilsMessage()

  extMessaging.onMessage('getVideoId', () => {
    return extractVideoId(location.href)
  })
}
