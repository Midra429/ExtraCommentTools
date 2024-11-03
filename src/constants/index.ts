/** GitHub */
export const GITHUB_URL = 'https://github.com/Midra429/ExtraCommentTools'

/** その他のリンク */
export const LINKS: {
  title: string
  label: string
  url?: string
}[] = [
  {
    title: 'X (Twitter)',
    label: '@Midra429',
    url: 'https://u.midra.me/x',
  },
  {
    title: 'Amazon',
    label: 'ほしい物リスト',
    url: 'https://u.midra.me/wishlist',
  },
  {
    title: 'Kyash ID',
    label: 'midra',
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
