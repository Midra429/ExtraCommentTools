import type { SettingsKey } from '@/types/storage'
import type { SettingsInputProps } from '@/components/SettingsInput'

export interface SettingsInitItem {
  id: string
  title: string
  items: SettingsInputProps<SettingsKey>[]
  icon?: React.FC<React.ComponentProps<'svg'>>
}

export type SettingsInitData = SettingsInitItem[]
