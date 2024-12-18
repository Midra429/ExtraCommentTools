import { webext } from '@/utils/webext'

const COLORS = {
  red: '#f31260',
  green: '#0dac52',
  blue: '#006fee',
  yellow: '#ef8511',
}

export const setBadge = async ({
  text,
  color,
  tabId,
}: {
  text: string | null
  color?: keyof typeof COLORS
  tabId?: number
}) => {
  const bgColor = COLORS[color ?? 'blue']
  const textColor = '#ffffff'

  await Promise.allSettled([
    webext.action.setBadgeBackgroundColor({
      color: bgColor,
      tabId,
    }),

    webext.action.setBadgeTextColor({
      color: textColor,
      tabId,
    }),

    webext.action.setBadgeText({
      text,
      tabId,
    }),
  ])
}
