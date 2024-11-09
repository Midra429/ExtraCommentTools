import type { SettingsKey, SettingItems } from '@/types/storage'

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: SettingItems = {
  // 全般
  'settings:theme': 'auto',
  'settings:showChangelog': true,
  'settings:showKawaiiPct': false,

  // コメント
  'settings:comment:showExtra': true,
  'settings:comment:mergeExtra': true,
  'settings:comment:translucentExtra': false,
  'settings:comment:extraColor': '#ffffff',
  'settings:comment:forceExtraColor': false,
  'settings:comment:showEasy': true,

  // 自動引用
  'settings:autoLoad:searchTargets': ['official', 'danime'],

  // キャプチャー
  'settings:capture:method': 'window',
  'settings:capture:format': 'jpeg',

  // 検索 (設定には非表示)
  'settings:searchOptions:sort': '-startTime',
  'settings:searchOptions:dateRange': [null, null],
  'settings:searchOptions:genre': 'アニメ',
  'settings:searchOptions:lengthRange': [null, null],
}

export const SETTINGS_DEFAULT_KEYS = Object.keys(
  SETTINGS_DEFAULT
) as SettingsKey[]
