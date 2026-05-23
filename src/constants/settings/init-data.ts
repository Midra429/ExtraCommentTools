import type { SettingsInitData } from '@/types/constants'

import {
  MessageSquareQuoteIcon,
  MessageSquareTextIcon,
  MoonIcon,
  SlidersHorizontalIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react'

import { SETTINGS_DEFAULT } from './default'

export const SETTINGS_INIT_DATA: SettingsInitData = [
  {
    id: 'general',
    title: '全般',
    icon: SlidersHorizontalIcon,
    items: [
      {
        settingsKey: 'theme',
        inputType: 'select',
        label: 'テーマ',
        options: [
          {
            label: '自動',
            value: 'auto',
            Icon: SunMoonIcon,
          },
          {
            label: 'ライト',
            value: 'light',
            Icon: SunIcon,
          },
          {
            label: 'ダーク',
            value: 'dark',
            Icon: MoonIcon,
          },
        ],
      },
      {
        settingsKey: 'showChangelog',
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
        settingsKey: 'comment:showExtra',
        inputType: 'toggle',
        label: '引用コメントを表示',
      },
      {
        settingsKey: 'comment:mergeExtra',
        inputType: 'toggle',
        label: '引用コメントを重ならないように表示',
        disable: {
          when: [
            {
              key: 'comment:showExtra',
              value: false,
            },
          ],
        },
      },
      {
        settingsKey: 'comment:translucentExtra',
        inputType: 'toggle',
        label: '引用コメントを半透明化',
        disable: {
          when: [
            {
              key: 'comment:showExtra',
              value: false,
            },
          ],
        },
      },
      {
        settingsKey: 'comment:extraColor',
        inputType: 'color-picker',
        label: '引用コメントの色',
        disable: {
          when: [
            {
              key: 'comment:showExtra',
              value: false,
            },
          ],
        },
      },
      {
        settingsKey: 'comment:forceExtraColor',
        inputType: 'toggle',
        label: '引用コメントの色を強制',
        description: 'コマンドによる色変更を上書きします。',
        disable: {
          operator: 'or',
          when: [
            {
              key: 'comment:showExtra',
              value: false,
            },
            {
              key: 'comment:extraColor',
              value: SETTINGS_DEFAULT['comment:extraColor'],
            },
          ],
        },
      },
      {
        settingsKey: 'comment:showEasy',
        inputType: 'toggle',
        label: 'かんたんコメントを表示',
      },
      {
        settingsKey: 'comment:hideAssistedComments',
        inputType: 'toggle',
        label: 'コメントアシストの表示を抑制',
        description:
          'コメントアシスト機能を使用したと予想されるコメントの表示を抑制します。\n※正確には判定できないので、テンプレコメントも対象になる可能性があります',
      },
    ],
  },
  {
    id: 'autoLoad',
    title: '自動引用',
    icon: MessageSquareQuoteIcon,
    items: [
      {
        settingsKey: 'autoLoad:searchTargets',
        inputType: 'checkbox',
        label: '検索対象',
        options: [
          { label: '公式チャンネル', value: 'official' },
          { label: 'dアニメストア', value: 'danime' },
        ],
        disable: {
          when: [
            {
              key: 'comment:showExtra',
              value: false,
            },
          ],
        },
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
