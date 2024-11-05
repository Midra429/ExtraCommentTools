import { defineBackground } from 'wxt/sandbox'
import { ncoApi } from '@midra/nco-api'

import { GITHUB_URL } from '@/constants'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/getFormsUrl'
import { settings } from '@/utils/settings/extension'
import { registerProxy } from '@/utils/proxy-service/register'
import { proxyMessaging } from '@/utils/proxy-service/messaging/extension'

import migration from './migration'
import requestPermissions from './requestPermissions'
import registerUtilsMessage from './registerUtilsMessage'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

const main = async () => {
  logger.log('background.js')

  registerProxy('ncoApi', ncoApi, proxyMessaging.onMessage)

  registerUtilsMessage()

  // インストール・アップデート時
  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    const { version } = webext.runtime.getManifest()

    requestPermissions()

    switch (reason) {
      case 'install':
        if (import.meta.env.PROD) {
          // README
          webext.tabs.create({
            url: `${GITHUB_URL}/blob/v${version}/README.md`,
          })
        }

        break

      case 'update':
        await migration()

        if (
          import.meta.env.PROD &&
          (await settings.get('settings:showChangelog'))
        ) {
          // リリースノート
          webext.tabs.create({
            url: `${GITHUB_URL}/releases/tag/v${version}`,
          })
        }

        break
    }
  })

  // コンテキストメニュー
  webext.contextMenus.removeAll().then(() => {
    webext.contextMenus.create({
      id: 'report',
      title: '不具合報告・機能提案・その他',
      contexts: ['action'],
    })

    webext.contextMenus.onClicked.addListener(async ({ menuItemId }) => {
      switch (menuItemId) {
        case 'report':
          const url = await getFormsUrl()

          webext.tabs.create({ url })

          break
      }
    })
  })
}
