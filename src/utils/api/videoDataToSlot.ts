import type { WatchV4Data } from '@midra/nco-utils/types/api/niconico/video'
import type { Slot } from '@/core/slots'
import type { ExtraVideoData } from '@/entrypoints/page.content/hooks'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

export function videoDataToSlot(
  data: WatchV4Data | ExtraVideoData,
  slot?: Partial<Slot>
): Slot {
  const isDAnime = data.metadata.jsonLd.owner.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime =
    !isDAnime &&
    data.metadata.jsonLd.owner.type === 'channel' &&
    (data.genre.key === 'anime' || data.genre.label === 'アニメ')

  return {
    id: data.video.id,
    type: (isDAnime && 'danime') || (isOfficialAnime && 'official') || 'normal',
    isStock: '_ect' in data ? data._ect.isStock : false,
    isAuto: '_ect' in data ? data._ect.isAuto : false,
    isManual: '_ect' in data ? data._ect.isManual : false,
    info: {
      title: data.video.title,
      duration: data.video.duration,
      date: new Date(data.video.registeredAt).getTime(),
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
