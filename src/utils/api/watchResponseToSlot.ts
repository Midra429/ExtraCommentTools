import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'
import type { Slot } from '@/core/slots'
import type { ExtraWatchResponse } from '@/entrypoints/page.content/hooks'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

export function watchResponseToSlot(
  res: WatchResponse | ExtraWatchResponse,
  slot?: Partial<Slot>
): Slot {
  const { data } = res
  const _ect = '_ect' in res ? res._ect : null

  const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime = !isDAnime && data.channel?.isOfficialAnime

  return {
    id: data.video.id,
    type: (isDAnime && 'danime') || (isOfficialAnime && 'official') || 'normal',
    isStock: !!_ect?.isStock,
    isAuto: !!_ect?.isAuto,
    isManual: !!_ect?.isManual,
    info: {
      title: data.video.title,
      duration: data.video.duration,
      date: data.video.registeredAt,
      count: {
        view: data.video.count.view,
        comment: data.video.count.comment,
      },
      thumbnail:
        data.video.thumbnail.large ||
        data.video.thumbnail.middle ||
        data.video.thumbnail.normal,
    },
    ...slot,
  }
}
