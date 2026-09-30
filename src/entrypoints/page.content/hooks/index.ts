import type { WatchV4Data } from '@midra/nco-utils/types/api/niconico/video'

import { SlotsManager } from '@/core/slots'
import { storage } from '@/utils/storage/page'

export interface ExtraVideoData extends WatchV4Data {
  _ect: {
    isStock: boolean
    isAuto: boolean
    isManual: boolean
  }
}

export const shared = new (class Shared {
  #videoId: string | null = null
  #targetVideoData: WatchV4Data | null = null
  #extraVideoDataList: ExtraVideoData[] = []
  #slotsManager: SlotsManager | null = null

  get videoId() {
    return this.#videoId
  }
  get targetVideoData() {
    return this.#targetVideoData
  }
  get extraVideoDataList() {
    return this.#extraVideoDataList
  }
  get slotsManager() {
    return this.#slotsManager
  }

  async initialize(videoId: string) {
    this.clear()

    this.#videoId = videoId
    this.#slotsManager = new SlotsManager(videoId, storage)

    await this.#slotsManager.initialize()
    await this.#slotsManager.remove({ isManual: false })
  }

  clear() {
    this.#videoId = null
    this.#targetVideoData = null
    this.#extraVideoDataList = []
    this.#slotsManager = null
  }

  setTargetVideoData(videoData: WatchV4Data) {
    this.#targetVideoData = videoData
  }

  addExtraVideoData(...data: ExtraVideoData[]) {
    this.#extraVideoDataList.push(...data)
  }
})()
