import { useEffect, useState, useImperativeHandle } from 'react'
import { Button, Input, cn } from '@heroui/react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'

import { useSlotsManager } from '@/hooks/useSlots'

import { Options } from './Options'

export interface SearchInputHandle {
  setValue: (value: string) => void
}

export interface SearchInputProps {
  isDisabled: boolean
  onSearch: (value: string) => void
  ref: React.Ref<SearchInputHandle>
}

export function SearchInput({ isDisabled, onSearch, ref }: SearchInputProps) {
  const [value, setValue] = useState('')
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  const slotsManager = useSlotsManager()

  const isSearchable = value.trim() && !isDisabled

  function search() {
    onSearch(value.trim())
  }

  useEffect(() => {
    slotsManager?.getParsedResult().then((parsed) => {
      if (!parsed) return

      const initValue =
        [
          parsed.titleStripped,
          parsed.season?.text,
          parsed.isSingleEpisode
            ? parsed.episode?.text
            : parsed.episodes?.map((v) => v.text).join(parsed.episodesDivider),
          parsed.subtitleStripped,
        ]
          .filter(Boolean)
          .join(' ') || parsed.input

      setValue(initValue)
    })
  }, [slotsManager])

  useImperativeHandle(ref, () => {
    return { setValue }
  }, [])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-1">
        <div className="flex w-full flex-row">
          <Input
            classNames={{
              label: 'hidden',
              mainWrapper: 'w-full',
              inputWrapper: [
                'border-1 border-divider border-r-0',
                'rounded-r-none',
                'shadow-none',
              ],
              input: 'pr-5',
              clearButton: 'end-1 mr-0 p-1',
            }}
            size="sm"
            label="検索欄"
            labelPlacement="outside-left"
            isClearable
            isDisabled={isDisabled}
            placeholder="キーワード / 動画ID / URL"
            value={value}
            onValueChange={setValue}
            onKeyDown={(evt) => {
              if (evt.key === 'Enter' && !isComposing && isSearchable) {
                search()
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />

          <Button
            className="rounded-l-none"
            size="sm"
            variant="solid"
            color="primary"
            isIconOnly
            isDisabled={isDisabled || !value.trim()}
            onPress={search}
          >
            <SearchIcon className="size-4" />
          </Button>
        </div>

        <Button
          className="min-w-6 shrink-0 p-0"
          size="sm"
          variant="light"
          disableRipple
          startContent={
            <ChevronDownIcon
              className={cn(
                'size-4',
                'rotate-0 data-[open=true]:rotate-180',
                'transition-transform'
              )}
              data-open={isOptionsOpen}
            />
          }
          onPress={() => setIsOptionsOpen((v) => !v)}
        />
      </div>

      <Options isOpen={isOptionsOpen} isDisabled={isDisabled} />
    </div>
  )
}
