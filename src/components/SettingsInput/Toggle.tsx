import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useMemo } from 'react'
import { Switch } from '@heroui/react'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends boolean ? key : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'toggle'> {}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  const [showExtra] = useSettings('settings:comment:showExtra')
  const [extraColor] = useSettings('settings:comment:extraColor')

  const isDisabled =
    ((props.settingsKey === 'settings:comment:mergeExtra' ||
      props.settingsKey === 'settings:comment:translucentExtra') &&
      !showExtra) ||
    (props.settingsKey === 'settings:comment:forceExtraColor' &&
      (!showExtra ||
        extraColor === SETTINGS_DEFAULT['settings:comment:extraColor'])) ||
    false

  return (
    <Switch
      classNames={{
        base: [
          'flex flex-row-reverse justify-between gap-2',
          'w-full max-w-full py-2',
          'overflow-hidden',
        ],
        wrapper: 'm-0',
        label: 'm-0',
      }}
      size="sm"
      isDisabled={isDisabled}
      isSelected={value}
      onValueChange={setValue}
    >
      <ItemLabel title={props.label} description={props.description} />
    </Switch>
  )
}
