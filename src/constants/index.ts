/** GitHub */
export const GITHUB_URL = 'https://github.com/Midra429/ExtraCommentTools'

/** その他のリンク */
export const LINKS: {
  title: string
  label: string
  url?: string
}[] = [
  {
    title: 'X / Twitter',
    label: '@Midra429',
    url: 'https://x.com/Midra429',
  },
  {
    title: 'Amazon',
    label: 'ほしい物リスト',
    url: 'https://u.midra.me/wishlist',
  },
]

/** Google フォーム */
export const GOOGLE_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdKaAMiPx0T-kiM49g9X0Knu9JGR77VBtSU2BCE6xBwELkP8g/viewform'

/** `?entry.ID=VALUE&` */
export const GOOGLE_FORMS_IDS = {
  CONTENT: '629118281',
  VERSION: '1294642704',
  OS: '2019782192',
  BROWSER: '1772003730',
  TITLE: '677186905',
} as const

/** ニコニコ コメント コマンド (色) */
export const NICONICO_COLORS: Record<string, string> = {
  // white: '#FFFFFF',
  red: '#FF0000',
  pink: '#FF8080',
  orange: '#FFC000',
  yellow: '#FFFF00',
  green: '#00FF00',
  cyan: '#00FFFF',
  blue: '#0000FF',
  purple: '#C000FF',
  black: '#000000',
  white2: '#CCCC99',
  niconicowhite: '#CCCC99',
  red2: '#CC0033',
  truered: '#CC0033',
  pink2: '#FF33CC',
  orange2: '#FF6600',
  passionorange: '#FF6600',
  yellow2: '#999900',
  madyellow: '#999900',
  green2: '#00CC66',
  elementalgreen: '#00CC66',
  cyan2: '#00CCCC',
  blue2: '#3399FF',
  marinblue: '#3399FF',
  purple2: '#6633CC',
  nobleviolet: '#6633CC',
  black2: '#666666',
}

export const NICONICO_COLOR_COMMANDS = Object.keys(NICONICO_COLORS)

export const COLOR_CODE = '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$'

export const COLOR_CODE_REGEXP = new RegExp(COLOR_CODE)

/** かわいい */
export const KAWAII_REGEXP = new RegExp(
  [
    '(可愛|かわい)(い|すぎ|過ぎ)',
    'かわ(ぃぃ|E)',
    '(カワ|ｶﾜ)(イイ|ｲｲ|ィィ|ｨｨ)',
    'kawaii',
    'かーいー',
  ].join('|'),
  'i'
)
