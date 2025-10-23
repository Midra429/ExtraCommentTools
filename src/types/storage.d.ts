import type { DateTimeDuration } from '@internationalized/date'
import type { NiconicoGenre } from '@midra/nco-utils/types/api/constants'
import type { SearchQuerySort } from '@midra/nco-utils/types/api/niconico/search'
import type { ParsedResult } from '@midra/nco-utils/parse'
import type { Slot } from '@/core/slots'

export interface InternalItems {
  _version: number
}

export interface SettingItems {
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
   * 設定: コメント > 引用コメントの色
   * @default '#FFFFFF'
   */
  'settings:comment:extraColor': string

  /**
   * 設定: コメント > 引用コメントの色を強制
   * @default false
   */
  'settings:comment:forceExtraColor': boolean

  /**
   * 設定: コメント > かんたんコメントを表示
   * @default true
   */
  'settings:comment:showEasy': boolean

  /**
   * 設定: コメント > コメントアシストの表示を抑制
   * @default true
   */
  'settings:comment:hideAssistedComments': boolean

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
}

export interface SettingsExportItems
  extends Partial<InternalItems & SettingItems> {}

export type SlotItems = {
  'slots:ids': string[]
} & {
  [key: `parsed:${string}`]: ParsedResult | null
  [key: `slots:${string}`]: Slot[] | null
}

export type StorageItems = InternalItems & SettingItems & SlotItems

export type InternalKey = keyof InternalItems
export type SettingsKey = keyof SettingItems
export type SettingsExportKey = keyof SettingsExportItems
export type StorageKey = keyof StorageItems
