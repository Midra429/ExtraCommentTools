import { useState, useImperativeHandle, forwardRef } from 'react'
import { Button, Input, cn } from '@heroui/react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'

import { Options } from './Options'

export type SearchInputHandle = {
  setValue: (value: string) => void
}

export type SearchInputProps = {
  isDisabled: boolean
  onSearch: (value: string) => void
}

export const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  ({ isDisabled, onSearch }, ref) => {
    const [value, setValue] = useState('')
    const [isOptionsOpen, setIsOptionsOpen] = useState(false)

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
                  'border-1 border-r-0 border-divider',
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
            />

            <Button
              className="rounded-l-none"
              size="sm"
              variant="solid"
              color="primary"
              isIconOnly
              isDisabled={isDisabled || !value.trim()}
              onPress={() => onSearch(value.trim())}
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
)
