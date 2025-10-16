import type { DeepPartial } from 'utility-types'
import type { ParsedResult } from '@midra/nco-utils/parse'
import type { StorageOnChangeCallback, WebExtStorage } from '@/utils/storage'

import equal from 'fast-deep-equal'

import { deepmerge } from '@/utils/deepmerge'

const SLOTS_MAX = 1000

export type Slot = {
  id: string
  type: 'normal' | 'official' | 'danime'
  isStock: boolean
  isAuto: boolean
  isManual: boolean
  offsetMs?: number
  commands?: string[]
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

export type SlotUpdate = DeepPartial<Slot> & Required<Pick<Slot, 'id'>>

/**
 * データ管理担当
 */
export class SlotsManager {
  readonly id: string
  readonly storage: WebExtStorage

  constructor(id: string, storage: WebExtStorage) {
    this.id = id
    this.storage = storage
  }

  async initialize() {
    await this.removeParsedResult()

    const slotIds = (await this.storage.get('slots:ids')) ?? []

    const existIdx = slotIds.findIndex((id) => id === this.id)

    if (existIdx !== -1) {
      slotIds.splice(existIdx, 1)
    }

    slotIds.push(this.id)

    const diff = slotIds.length - SLOTS_MAX

    if (0 < diff) {
      const deletedSlotIds = slotIds.splice(0, diff)

      for (const id of deletedSlotIds) {
        await this.storage.remove(`parsed:${id}`, `slots:${id}`)
      }
    }

    await this.storage.set('slots:ids', slotIds)
  }

  getParsedResult(): Promise<ParsedResult | null> {
    return this.storage.get(`parsed:${this.id}`)
  }

  setParsedResult(parsed: ParsedResult) {
    return this.storage.set(`parsed:${this.id}`, parsed)
  }

  removeParsedResult() {
    return this.storage.remove(`parsed:${this.id}`)
  }

  get(): Promise<Slot[] | null> {
    return this.storage.get(`slots:${this.id}`)
  }

  set(slots: Slot[]) {
    return this.storage.set(`slots:${this.id}`, slots)
  }

  async add(...slots: Slot[]) {
    const oldSlots = (await this.get()) ?? []
    const newSlots: Slot[] = []

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

  async update(slot: SlotUpdate): Promise<boolean> {
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

  async remove(target?: Partial<Slot>) {
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
