import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { onMessage } from '@/utils/proxy-service/messaging/page'
import { registerProxy } from '@/utils/proxy-service/register'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/extension'

import registerMessaging from './registerMessaging'
import registerStorageMessage from './registerStorageMessage'

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
  registerMessaging()
}
