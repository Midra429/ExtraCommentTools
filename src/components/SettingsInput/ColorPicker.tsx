import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { cn } from '@nextui-org/react'

import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'
import { settings } from '@/utils/settings/extension'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'color-picker',
  {}
>

export const Input: React.FC<Props> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (props.settingsKey === 'settings:comment:extraColor') {
      return settings.watch('settings:comment:showExtra', (val) => {
        setIsDisabled(!val)
      })
    }
  }, [])

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between gap-1',
        'py-2',
        'data-[disabled=true]:opacity-50',
        'data-[disabled=true]:pointer-events-none'
      )}
      data-disabled={isDisabled}
    >
      <ItemLabel title={props.label} description={props.description} />

      <label
        className={cn(
          'relative',
          'block',
          'h-8 w-20',
          'border-1 border-foreground-200 hover:border-default-400',
          'rounded-small',
          'transition-colors !duration-150',
          'cursor-pointer'
        )}
        style={{
          backgroundColor: value,
        }}
        htmlFor={props.settingsKey}
      >
        <input
          className="invisible absolute bottom-0 left-0 size-0"
          id={props.settingsKey}
          type="color"
          disabled={isDisabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
    </div>
  )
}
