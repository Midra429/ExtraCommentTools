import type { DateTimeDuration } from '@internationalized/date'
import type { NiconicoGenre } from '@midra/nco-api/types/constants'
import type { SearchQuerySort } from '@midra/nco-api/types/niconico/search'
import type { ExtSlotItems } from '@/core/slots'

export type StorageItems_v1 = {
  // 設定: 全般 //////////////////////////////////////////////////
  /**
   * 設定: 全般 > テーマ
   * @default 'auto'
   */
  'settings:theme': 'auto' | 'light' | 'dark'

  /**
   * 設定: 全般 > 更新内容を表示
   * @default true
   */
  'settings:showChangelog': boolean

  /**
   * 設定: 全般 > コメントのかわいい率を表示
   * @default false
   */
  'settings:showKawaiiPct': boolean

  // 設定: コメント //////////////////////////////////////////////////
  /**
   * 設定: コメント > 引用コメントを表示
   * @default true
   */
  'settings:comment:showExtra': boolean

  /**
   * 設定: コメント > 引用コメントを統合
   * @default true
   */
  'settings:comment:mergeExtra': boolean

  /**
   * 設定: コメント > 引用コメントを半透明化
   * @default true
   */
  'settings:comment:translucentExtra': boolean

  /**
   * 設定: コメント > かんたんコメントを表示
   * @default true
   */
  'settings:comment:showEasy': boolean

  // 設定: 自動引用 //////////////////////////////////////////////////
  /**
   * 設定: 自動引用 > 検索対象
   * @default ['official', 'danime']
   */
  'settings:autoLoad:searchTargets': ('official' | 'danime')[]

  // 設定: スクリーンショット //////////////////////////////////////////////////
  /**
   * 設定: スクリーンショット > 方式
   * @default 'window'
   */
  'settings:capture:method': 'window' | 'copy'

  /**
   * 設定: スクリーンショット > フォーマット
   * @default 'jpeg'
   */
  'settings:capture:format': 'jpeg' | 'png'

  // 検索オプション //////////////////////////////////////////////////
  /**
   * 検索オプション: ソート順
   * @default '-startTime'
   */
  'settings:searchOptions:sort': SearchQuerySort

  /**
   * 検索オプション: 投稿日時
   * @default [null, null]
   */
  'settings:searchOptions:dateRange': [
    start: DateTimeDuration | null,
    end: DateTimeDuration | null,
  ]

  /**
   * 検索オプション: ジャンル
   * @default 'アニメ'
   */
  'settings:searchOptions:genre': '未指定' | NiconicoGenre

  /**
   * 検索オプション: 再生時間
   * @default [null, null]
   */
  'settings:searchOptions:lengthRange': [
    start: number | null,
    end: number | null,
  ]

  // ExtSlot //////////////////////////////////////////////////
  'slots:ids': string[]
}

export type StorageItems = StorageItems_v1 & {
  _version: number
} & ExtSlotItems

export type StorageKey = keyof StorageItems

export type InternalKey = Extract<StorageKey, `_${string}`>
export type InternalItems = {
  [key in InternalKey]: StorageItems[key]
}

export type SettingsKey = Extract<StorageKey, `settings:${string}`>
export type SettingItems = {
  [key in SettingsKey]: StorageItems[key]
}

export type SettingsExportKey = InternalKey | SettingsKey
export type SettingsExportItems = Partial<InternalItems & SettingItems>
