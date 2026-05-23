import type { SearchQueryFilters } from '@midra/nco-utils/types/api/niconico/search'
import type { SettingItems } from '@/types/storage'

import { getLocalTimeZone, now } from '@internationalized/date'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { searchDataToSlot } from './searchDataToSlot'
import { videoDataToSlot } from './videoDataToSlot'

const TIMEZONE_SUFFIX_REGEXP = /\[.+\]$/

export async function searchNiconicoByIds(...ids: string[]) {
  const data = await ncoApiProxy.niconico.multipleVideo(ids)
  const filtered = data.filter((v) => v !== null)

  if (filtered.length) {
    const total = filtered.length
    const slots = filtered.map((v) => videoDataToSlot(v))

    return { total, slots }
  }

  return null
}

export interface SearchNiconicoOptions {
  sort?: SettingItems['searchOptions:sort']
  dateRange?: SettingItems['searchOptions:dateRange']
  genre?: SettingItems['searchOptions:genre']
  lengthRange?: SettingItems['searchOptions:lengthRange']
}

export async function searchNiconicoByKeyword(
  keyword: string,
  page: number,
  options?: SearchNiconicoOptions
) {
  const limit = 20
  const offset = limit * (page - 1)

  const current = now(getLocalTimeZone())

  const filters: SearchQueryFilters = {
    commentCounter: { gt: 0 },
    startTime: options?.dateRange
      ? {
          gte: options.dateRange[0]
            ? current
                .add(options.dateRange[0])
                .toString()
                .replace(TIMEZONE_SUFFIX_REGEXP, '')
            : undefined,
          lte: options.dateRange[1]
            ? current
                .add(options.dateRange[1])
                .toString()
                .replace(TIMEZONE_SUFFIX_REGEXP, '')
            : undefined,
        }
      : undefined,
    'genre.keyword':
      options?.genre && options.genre !== '未指定'
        ? [options.genre]
        : undefined,
    lengthSeconds: options?.lengthRange
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
