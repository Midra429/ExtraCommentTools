import type { SettingsKey } from '@/types/storage'

import * as Select from './Select'
import * as Toggle from './Toggle'
import * as Text from './Text'
import * as Range from './Range'
import * as Checkbox from './Checkbox'
import * as Checkcard from './Checkcard'

export type SettingsInputBaseProps<
  K extends SettingsKey,
  T extends SettingsInputType,
  P extends object = {},
> = {
  settingsKey: K
  inputType: T
  label: string
  description?: string
} & P

export type SettingsInputType = keyof typeof SettingsInput

export type SettingsInputProps<K extends SettingsKey> =
  | (K extends Select.Key ? Select.Props<K> : never)
  | (K extends Toggle.Key ? Toggle.Props<K> : never)
  | (K extends Text.Key ? Text.Props<K> : never)
  | (K extends Range.Key ? Range.Props<K> : never)
  | (K extends Checkbox.Key ? Checkbox.Props<K> : never)
  | (K extends Checkcard.Key ? Checkcard.Props<K> : never)

export const SettingsInput = {
  select: Select.Input,
  toggle: Toggle.Input,
  text: Text.Input,
  range: Range.Input,
  checkbox: Checkbox.Input,
  checkcard: Checkcard.Input,
}
