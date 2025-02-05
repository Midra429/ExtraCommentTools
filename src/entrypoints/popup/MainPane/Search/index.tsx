import type { SearchNiconicoOptions } from '@/utils/api/searchNiconico'
import type { ExtSlot } from '@/core/slots'
import type { SearchInputHandle } from './Input'

import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Spinner, cn } from '@heroui/react'

import { extractVideoId } from '@/utils/api/extractVideoId'
import {
  searchNiconicoByIds,
  searchNiconicoByKeyword,
} from '@/utils/api/searchNiconico'
import { useSettings } from '@/hooks/useSettings'

import { SearchInput } from './Input'
import { Results } from './Results'
import { Pagination } from './Pagination'

export const Search: React.FC = memo(() => {
  const inputRef = useRef<SearchInputHandle>(null)

  const [inputValue, setInputValue] = useState<string>()

  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [slots, setSlots] = useState<ExtSlot[]>([])

  const [sort] = useSettings('settings:searchOptions:sort')
  const [dateRange] = useSettings('settings:searchOptions:dateRange')
  const [genre] = useSettings('settings:searchOptions:genre')
  const [lengthRange] = useSettings('settings:searchOptions:lengthRange')

  const options = useMemo<SearchNiconicoOptions>(() => {
    return {
      sort,
      dateRange,
      genre,
      lengthRange,
    }
  }, [sort, dateRange, genre, lengthRange])

  const search = useCallback(
    async (value: string, page: number, options: SearchNiconicoOptions) => {
      setIsLoading(true)

      setCurrentPage(page)
      setSlots([])

      const videoId = extractVideoId(value)

      const result = videoId
        ? await searchNiconicoByIds(videoId)
        : await searchNiconicoByKeyword(value, page, options)

      if (result) {
        setTotalCount(result.total)
        setSlots(result.slots)
      } else {
        setTotalCount(0)
      }

      setIsLoading(false)
    },
    []
  )

  useEffect(() => {
    if (!inputValue) return

    inputRef.current?.setValue(inputValue)

    if (!extractVideoId(inputValue)) {
      search(inputValue, 1, options)
    }
  }, [options])

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex flex-col gap-2',
          'p-2',
          'bg-content1',
          'border-b-1 border-foreground-200'
        )}
      >
        <SearchInput
          isDisabled={isLoading}
          onSearch={(value) => {
            setInputValue(value)

            search(value, 1, options)
          }}
          ref={inputRef}
        />
      </div>

      <div className="relative h-full overflow-y-auto p-2">
        {isLoading ? (
          <div
            className={cn(
              'absolute inset-0 z-20',
              'flex size-full items-center justify-center'
            )}
          >
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <Results slots={slots} />
        )}
      </div>

      <div className="border-t-1 border-foreground-200 bg-content1 p-2">
        <Pagination
          page={currentPage}
          total={totalCount}
          isDisabled={isLoading}
          onPageChange={(page) => {
            if (!inputValue) return

            inputRef.current?.setValue(inputValue)

            search(inputValue, page, options)
          }}
        />
      </div>
    </div>
  )
})
