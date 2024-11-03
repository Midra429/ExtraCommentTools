import type { ExtSlot } from '@/core/slots'
import type { PanelItemProps } from '@/components/PanelItem'

import { useCallback, useState } from 'react'
import { cn } from '@nextui-org/react'

import { slotsManager } from '@/hooks/useExtSlots'

import { PanelItem } from '@/components/PanelItem'

import { ButtonsOverlay } from './ButtonsOverlay'
import { AddButton } from './AddButton'
import { Thumbnail } from './Thumbnail'
import { DateTime } from './DateTime'
import { Title } from './Title'
import { Counts } from './Counts'
import { Options, OptionsButton } from './Options'

export type SlotItemProps = {
  classNames?: PanelItemProps['classNames']
  slot: ExtSlot
  isSearch?: boolean
  isDisabled?: boolean
}

export const SlotItem: React.FC<SlotItemProps> = ({
  classNames,
  slot,
  isSearch,
  isDisabled,
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const onPressAdd = useCallback(async () => {
    await slotsManager?.add({
      ...slot,
      isManual: true,
    })
  }, [slot])

  const onPressRemove = useCallback(async () => {
    await slotsManager?.remove({ id: slot.id })
  }, [slot.id])

  return (
    <PanelItem
      className={cn(isDisabled && 'pointer-events-none opacity-50')}
      classNames={{
        ...classNames,
        wrapper: [
          isDisabled && 'border-dashed bg-transparent',
          classNames?.wrapper,
        ],
      }}
    >
      <div
        className={cn(
          'relative flex flex-row p-1',
          isSearch ? 'h-[5.125rem] gap-1.5' : 'h-[5.75rem] gap-2'
        )}
      >
        <div className="relative h-full shrink-0">
          {/* サムネイル */}
          <Thumbnail
            type={slot.type}
            offsetMs={slot.offsetMs}
            isManual={slot.isManual}
            info={slot.info}
            isSearch={isSearch}
          />

          {isSearch ? (
            <AddButton onPress={onPressAdd} />
          ) : (
            <ButtonsOverlay isManual={slot.isManual} onRemove={onPressRemove} />
          )}
        </div>

        {/* 情報 (右) */}
        <div className="flex size-full flex-col gap-0.5">
          {/* 日付 */}
          <DateTime date={slot.info.date} isSearch={isSearch} />

          {/* タイトル */}
          <Title id={slot.id} title={slot.info.title} isSearch={isSearch} />

          {/* 再生数 / コメント数 / かわいい率 */}
          <Counts count={slot.info.count} isSearch={isSearch} />
        </div>

        {/* サイドボタン */}
        {!isSearch && (
          <div className="flex h-full shrink-0 flex-col justify-end gap-1">
            {/* 設定ボタン */}
            <OptionsButton
              isOpen={isOptionsOpen}
              onPress={() => setIsOptionsOpen((v) => !v)}
            />
          </div>
        )}
      </div>

      {/* 設定 */}
      {!isSearch && (
        <Options
          isOpen={isOptionsOpen}
          id={slot.id}
          isStock={slot.isStock}
          isAuto={slot.isAuto}
          offsetMs={slot.offsetMs}
        />
      )}
    </PanelItem>
  )
}
