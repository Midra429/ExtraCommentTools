import type { SearchQueryFilters } from '@midra/nco-api/types/niconico/search'
import type { SettingItems } from '@/types/storage'

import { now, getLocalTimeZone } from '@internationalized/date'

import { ncoApiProxy } from '@/proxy/nco-api/extension'

import { videoDataToSlot } from './videoDataToSlot'
import { searchDataToSlot } from './searchDataToSlot'

export const searchNiconicoByIds = async (...ids: string[]) => {
  const videoDataList = await ncoApiProxy.niconico.multipleVideo(ids)
  const filtered = videoDataList.filter((v) => v !== null)

  if (filtered.length) {
    const total = filtered.length
    const slots = filtered.map((v) => videoDataToSlot(v))

    return { total, slots }
  }

  return null
}

export type SearchNiconicoOptions = {
  sort?: SettingItems['settings:searchOptions:sort']
  dateRange?: SettingItems['settings:searchOptions:dateRange']
  genre?: SettingItems['settings:searchOptions:genre']
  lengthRange?: SettingItems['settings:searchOptions:lengthRange']
}

export const searchNiconicoByKeyword = async (
  keyword: string,
  page: number,
  options?: SearchNiconicoOptions
) => {
  const limit = 20
  const offset = limit * (page - 1)

  const current = now(getLocalTimeZone())

  const filters: SearchQueryFilters = {
    'commentCounter': { gt: 0 },
    'startTime': options?.dateRange
      ? {
          gte: options.dateRange[0]
            ? current
                .add(options.dateRange[0])
                .toString()
                .replace(/\[.+\]$/, '')
            : undefined,
          lte: options.dateRange[1]
            ? current
                .add(options.dateRange[1])
                .toString()
                .replace(/\[.+\]$/, '')
            : undefined,
        }
      : undefined,
    'genre.keyword':
      options?.genre && options.genre !== '未指定'
        ? [options.genre]
        : undefined,
    'lengthSeconds': options?.lengthRange
      ? {
          gte: options.lengthRange[0] ?? undefined,
          lte: options.lengthRange[1] ?? undefined,
        }
      : undefined,
  }

  const response = await ncoApiProxy.niconico.search({
    q: keyword,
    targets: ['title', 'description'],
    fields: [
      'contentId',
      'title',
      'userId',
      'channelId',
      'viewCounter',
      'lengthSeconds',
      'thumbnailUrl',
      'startTime',
      'commentCounter',
      'categoryTags',
    ],
    filters,
    _sort: options?.sort ?? '-startTime',
    _offset: offset,
    _limit: limit,
    _context: EXT_USER_AGENT,
  })

  if (response) {
    const { meta, data } = response

    const total = Math.ceil(meta.totalCount / limit)
    const slots = data.map((v) => searchDataToSlot(v))

    return { total, slots }
  }

  return null
}
