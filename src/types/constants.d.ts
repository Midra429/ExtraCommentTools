import type { SettingsInputProps } from '@/components/SettingsInput'
import type { SettingsKey } from '@/types/storage'

export interface SettingsInitItem {
  id: string
  title: string
  items: SettingsInputProps<SettingsKey>[]
  icon?: React.FC<React.ComponentProps<'svg'>>
}

export type SettingsInitData = SettingsInitItem[]
