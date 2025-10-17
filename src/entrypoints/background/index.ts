import { defineBackground } from '#imports'
import { ncoApi } from '@midra/nco-utils/api'
import { ncoSearch } from '@midra/nco-utils/search'

import { GITHUB_URL } from '@/constants'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/getFormsUrl'
import { setBadge } from '@/utils/extension/setBadge'
import { settings } from '@/utils/settings/extension'
import { registerProxy } from '@/utils/proxy-service/register'
import { onMessage } from '@/utils/proxy-service/messaging/extension'
import { extractVideoId } from '@/utils/api/extractVideoId'

import migration from './migration'
import requestPermissions from './requestPermissions'
import registerUtilsMessage from './registerUtilsMessage'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

function main() {
  logger.log('background.js')

  registerProxy('ncoApi', ncoApi, onMessage)
  registerProxy('ncoSearch', ncoSearch, onMessage)
  registerUtilsMessage()

  // 権限をリクエスト
  requestPermissions()

  // インストール・アップデート時
  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    const { version } = webext.runtime.getManifest()

    switch (reason) {
      case 'install':
        if (import.meta.env.PROD) {
          // README
          webext.tabs.create({
            url: `${GITHUB_URL}/blob/main/README.md`,
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
          webext.tabs.create({
            url: await getFormsUrl(),
          })

          break
      }
    })
  })

  // タブ更新時
  webext.tabs.onUpdated.addListener((tabId, { status, url }) => {
    switch (status) {
      case 'loading':
      case 'complete':
        // バッジをリセット
        if (url && !extractVideoId(url)) {
          setBadge({ tabId, text: null })
        }

        break
    }
  })
}
