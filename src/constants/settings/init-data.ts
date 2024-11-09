import type { SettingsInitData } from '@/types/constants'

import {
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  MessageSquareQuoteIcon,
  CameraIcon,
  SunMoonIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react'

export const SETTINGS_INIT_DATA: SettingsInitData = [
  {
    id: 'general',
    title: '全般',
    icon: SlidersHorizontalIcon,
    items: [
      {
        settingsKey: 'settings:theme',
        inputType: 'select',
        label: 'テーマ',
        options: [
          {
            label: '自動',
            value: 'auto',
            icon: SunMoonIcon,
          },
          {
            label: 'ライト',
            value: 'light',
            icon: SunIcon,
          },
          {
            label: 'ダーク',
            value: 'dark',
            icon: MoonIcon,
          },
        ],
      },
      {
        settingsKey: 'settings:showChangelog',
        inputType: 'toggle',
        label: '更新内容を表示',
        description: 'アップデート後に更新内容を新しいタブで開きます。',
      },
      // {
      //   settingsKey: 'settings:showKawaiiPct',
      //   inputType: 'toggle',
      //   label: 'コメントのかわいい率を表示',
      // },
    ],
  },
  {
    id: 'comment',
    title: 'コメント',
    icon: MessageSquareTextIcon,
    items: [
      {
        settingsKey: 'settings:comment:showExtra',
        inputType: 'toggle',
        label: '引用コメントを表示',
      },
      {
        settingsKey: 'settings:comment:mergeExtra',
        inputType: 'toggle',
        label: '引用コメントを重ならないように表示',
      },
      {
        settingsKey: 'settings:comment:translucentExtra',
        inputType: 'toggle',
        label: '引用コメントを半透明化',
      },
      {
        settingsKey: 'settings:comment:extraColor',
        inputType: 'color-picker',
        label: '引用コメントの色',
      },
      {
        settingsKey: 'settings:comment:forceExtraColor',
        inputType: 'toggle',
        label: '引用コメントの色を強制',
        description: 'コマンドによる色変更を上書きします。',
      },
      {
        settingsKey: 'settings:comment:showEasy',
        inputType: 'toggle',
        label: 'かんたんコメントを表示',
      },
    ],
  },
  {
    id: 'autoLoad',
    title: '自動引用',
    icon: MessageSquareQuoteIcon,
    items: [
      {
        settingsKey: 'settings:autoLoad:searchTargets',
        inputType: 'checkbox',
        label: '検索対象',
        options: [
          { label: '公式チャンネル', value: 'official' },
          { label: 'dアニメストア', value: 'danime' },
        ],
      },
    ],
  },
  // {
  //   id: 'capture',
  //   title: 'スクリーンショット',
  //   icon: CameraIcon,
  //   items: [
  //     {
  //       settingsKey: 'settings:capture:method',
  //       inputType: 'select',
  //       label: '方式',
  //       options: [
  //         { label: 'ウィンドウ', value: 'window' },
  //         { label: 'コピー', value: 'copy' },
  //       ],
  //     },
  //     {
  //       settingsKey: 'settings:capture:format',
  //       inputType: 'select',
  //       label: 'フォーマット',
  //       options: [
  //         { label: 'JPEG', value: 'jpeg' },
  //         { label: 'PNG', value: 'png' },
  //       ],
  //     },
  //   ],
  // },
]
