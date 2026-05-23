import type { SettingItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { cn } from '@heroui/react'

import { NICONICO_COLORS } from '@/constants'
import { SETTINGS_DEFAULT } from '@/constants/settings/default'
import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

import { ColorPicker } from '../ColorPicker'
import { initConditional } from '.'

const PRESET_COLORS = [
  ...new Set(['#FFFFFF', ...Object.values(NICONICO_COLORS)]),
]

export type Key = {
  [P in SettingsKey]: SettingItems[P] extends string ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'color-picker'> {
  alpha?: boolean
}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

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

      <ColorPicker
        hex={value}
        defaultHex={SETTINGS_DEFAULT[props.settingsKey]}
        alpha={props.alpha}
        presets={PRESET_COLORS}
        isDisabled={isDisabled}
        onChange={setValue}
      />
    </div>
  )
}
