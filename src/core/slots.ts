import type { DeepPartial } from 'utility-types'
import type { StorageOnChangeCallback, WebExtStorage } from '@/utils/storage'

import equal from 'fast-deep-equal'

import { deepmerge } from '@/utils/deepmerge'

const EXT_SLOTS_MAX = 500

export type ExtSlot = {
  id: string
  type: 'normal' | 'official' | 'danime'
  isStock: boolean
  isAuto: boolean
  isManual: boolean
  offsetMs?: number
  info: {
    title: string
    duration: number
    date: number
    count: {
      view: number
      comment: number
      kawaii?: number
    }
    thumbnail?: string
  }
}

export type ExtSlotUpdate = DeepPartial<ExtSlot> & Required<Pick<ExtSlot, 'id'>>

export type ExtSlotItems = {
  [key: `slots:${string}`]: ExtSlot[] | null
}

/**
 * データ管理担当
 */
export class ExtSlotsManager {
  readonly id: string
  readonly storage: WebExtStorage

  constructor(id: string, storage: WebExtStorage) {
    this.id = id
    this.storage = storage
  }

  async initialize() {
    const slotIds = [...((await this.storage.get('slots:ids')) ?? [])]

    const existIdx = slotIds.findIndex((id) => id === this.id) ?? -1

    if (existIdx !== -1) {
      slotIds.splice(existIdx, 1)
    }

    slotIds.push(this.id)

    const diff = slotIds.length - EXT_SLOTS_MAX

    if (0 < diff) {
      const deletedSlotIds = slotIds.splice(0, diff)

      for (const id of deletedSlotIds) {
        await this.storage.remove(`slots:${id}`)
      }
    }

    await this.storage.set('slots:ids', slotIds)
  }

  get(): Promise<ExtSlot[] | null> {
    return this.storage.get(`slots:${this.id}`)
  }

  set(slots: ExtSlot[]) {
    return this.storage.set(`slots:${this.id}`, slots)
  }

  async add(...slots: NonNullable<ExtSlot[]>) {
    const oldSlots = (await this.get()) ?? []
    const newSlots: NonNullable<ExtSlot[]> = []

    slots.forEach((slot) => {
      const idx = oldSlots.findIndex((v) => v.id === slot.id) ?? -1

      if (idx !== -1) {
        oldSlots[idx] = slot
      } else {
        newSlots.push(slot)
      }
    })

    return this.set([...oldSlots, ...newSlots])
  }

  async update(slot: ExtSlotUpdate): Promise<boolean> {
    const slots = await this.get()

    if (!slots) {
      return false
    }

    const idx = slots.findIndex((v) => v.id === slot.id)

    if (idx !== -1) {
      const newSlot = deepmerge(slots[idx], slot)

      if (!equal(slots[idx], newSlot)) {
        slots[idx] = newSlot

        await this.set(slots)

        return true
      }
    }

    return false
  }

  async remove(target?: Partial<ExtSlot>) {
    if (target) {
      const oldSlots = await this.get()

      if (oldSlots) {
        const entries = Object.entries(target)

        const newSlots = oldSlots.filter((old) => {
          return !entries.every(([key, val]) => {
            return equal(old[key as keyof typeof old], val)
          })
        })

        if (oldSlots.length !== newSlots.length) {
          return this.set(newSlots)
        }
      }
    } else {
      return this.storage.remove(`slots:${this.id}`)
    }
  }

  onChange(callback: StorageOnChangeCallback<`slots:${string}`>) {
    return this.storage.onChange(`slots:${this.id}`, callback)
  }
}
