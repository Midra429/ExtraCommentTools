import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Switch } from '@nextui-org/react'

import { settings } from '@/utils/settings/extension'
import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends boolean ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<K, 'toggle', {}>

export const Input: React.FC<Props> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (props.settingsKey === 'settings:comment:mergeExtra') {
      return settings.watch('settings:comment:showExtra', (val) => {
        setIsDisabled(!val)
      })
    }
  }, [])

  return (
    <Switch
      classNames={{
        base: [
          'flex flex-row-reverse justify-between gap-2',
          'w-full max-w-full py-2',
          'overflow-hidden',
        ],
        wrapper: 'm-0',
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
