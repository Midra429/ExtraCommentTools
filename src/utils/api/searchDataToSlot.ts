import type { SearchData } from '@midra/nco-api/types/niconico/search'
import type { ExtSlot } from '@/core/slots'

import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

export const searchDataToSlot = (
  data: SearchData<
    | 'contentId'
    | 'title'
    | 'userId'
    | 'channelId'
    | 'viewCounter'
    | 'lengthSeconds'
    | 'thumbnailUrl'
    | 'startTime'
    | 'commentCounter'
    | 'categoryTags'
  >,
  slot?: Partial<ExtSlot>
): ExtSlot => {
  const isDAnime = data.channelId === DANIME_CHANNEL_ID
  const isOfficialAnime = !!(
    data.channelId &&
    data.categoryTags &&
    /(^|\s)アニメ(\s|$)/.test(data.categoryTags)
  )

  return {
    id: data.contentId,
    type: (isDAnime && 'danime') || (isOfficialAnime && 'official') || 'normal',
    isStock: false,
    isAuto: false,
    isManual: false,
    info: {
      title: data.title,
      duration: data.lengthSeconds,
      date: new Date(data.startTime).getTime(),
      count: {
        view: data.viewCounter,
        comment: data.commentCounter,
      },
      thumbnail: data.thumbnailUrl,
    },
    ...slot,
  }
}
