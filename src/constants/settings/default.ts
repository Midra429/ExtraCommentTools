import type { SettingItems, SettingsKey } from '@/types/storage'

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: SettingItems = {
  // 全般
  theme: 'auto',
  showChangelog: true,
  showKawaiiPct: false,

  // コメント
  'comment:showExtra': true,
  'comment:mergeExtra': true,
  'comment:translucentExtra': false,
  'comment:extraColor': '#FFFFFF',
  'comment:forceExtraColor': false,
  'comment:showEasy': true,
  'comment:hideAssistedComments': false,

  // 自動引用
  'autoLoad:searchTargets': ['official', 'danime'],

  // キャプチャー
  'capture:method': 'window',
  'capture:format': 'jpeg',

  // 検索 (設定には非表示)
  'searchOptions:sort': '-startTime',
  'searchOptions:dateRange': [null, null],
  'searchOptions:genre': 'アニメ',
  'searchOptions:lengthRange': [null, null],
}

export const SETTINGS_DEFAULT_KEYS = Object.keys(
  SETTINGS_DEFAULT
) as SettingsKey[]
