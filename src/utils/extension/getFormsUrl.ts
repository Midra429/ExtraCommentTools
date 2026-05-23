import type { Browser } from '@/utils/webext'

import { GOOGLE_FORMS_IDS, GOOGLE_FORMS_URL } from '@/constants'
import { webext } from '@/utils/webext'

const CONTENTS = {
  bug: '不具合報告',
  suggestion: '機能提案',
  other: 'その他',
} as const

const OS_NAMES: Partial<Record<Browser.runtime.PlatformOs, string>> = {
  win: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  cros: 'ChromeOS',
  android: 'Android',
}

export const getFormsUrl = async ({
  content,
  url,
}: {
  content?: keyof typeof CONTENTS
  url?: string | null
} = {}) => {
  const { os } = await webext.runtime.getPlatformInfo()
  const { version } = webext.runtime.getManifest()

  const osName = OS_NAMES[os]

  const formUrl = new URL(GOOGLE_FORMS_URL)

  // 内容
  if (content) {
    formUrl.searchParams.set(
      `entry.${GOOGLE_FORMS_IDS.CONTENT}`,
      CONTENTS[content]
    )
  }

  // バージョン
  formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.VERSION}`, version)

  // OS
  if (osName) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.OS}`, osName)
  }

  // ブラウザ
  if (webext.isChrome) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Chrome')
  } else if (webext.isFirefox) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Firefox')
  }

  // 該当の動画
  if (url) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.TITLE}`, url)
  }

  return formUrl.href
}
