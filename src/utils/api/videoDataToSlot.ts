import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'
import type { ExtSlot } from '@/core/slots'
import type { ExtraVideoData } from '@/entrypoints/page.content/hooks'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

export function videoDataToSlot(
  data: VideoData | ExtraVideoData,
  slot?: Partial<ExtSlot>
): ExtSlot {
  const isDAnime = data.channel?.id === `ch${DANIME_CHANNEL_ID}`
  const isOfficialAnime = !!data.channel?.isOfficialAnime

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
        data.video.thumbnail.largeUrl ||
        data.video.thumbnail.middleUrl ||
        data.video.thumbnail.url,
    },
    ...slot,
  }
}
