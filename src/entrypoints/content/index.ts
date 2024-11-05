import { defineContentScript } from 'wxt/sandbox'

import { MATCHES } from '@/constants/matches'

import { extractVideoId } from '@/utils/api/extractVideoId'
import { registerProxy } from '@/utils/proxy-service/register'
import { proxyMessaging } from '@/utils/proxy-service/messaging/page'
import { extMessaging } from '@/core/messaging'
import { ncoApiProxy } from '@/proxy/nco-api/extension'

import registerStorageMessage from './registerStorageMessage'
import registerUtilsMessage from './registerUtilsMessage'

export default defineContentScript({
  matches: MATCHES,
  runAt: 'document_start',
  main: () => void main(),
})

const main = () => {
  window.addEventListener('DOMContentLoaded', () => {
    // 動画情報APIが必ず実行されるようにする
    document.querySelector('[name="server-response"]')?.remove()
  })

  registerProxy('ncoApi', ncoApiProxy, proxyMessaging.onMessage)

  registerStorageMessage()
  registerUtilsMessage()

  extMessaging.onMessage('getVideoId', () => {
    return extractVideoId(location.href)
  })
}
