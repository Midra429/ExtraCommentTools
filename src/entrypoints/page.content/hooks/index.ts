import type { VideoData } from '@midra/nco-api/types/niconico/video'

import { storage } from '@/utils/storage/page'
import { ExtSlotsManager } from '@/core/slots'

export type ExtraVideoData = VideoData & {
  _ect: {
    isStock: boolean
    isAuto: boolean
    isManual: boolean
  }
}

export const hooksSharedData = new (class HooksSharedData {
  #videoId: string | null = null
  #videoData: VideoData | null = null
  #extraVideoDataList: ExtraVideoData[] = []
  #slotsManager: ExtSlotsManager | null = null

  async initialize(videoId: string) {
    if (this.#videoId === videoId) return

    this.clear()

    this.#videoId = videoId
    this.#slotsManager = new ExtSlotsManager(videoId, storage)

    await this.#slotsManager.initialize()
    await this.#slotsManager.remove({ isManual: false })
  }

  clear() {
    this.#videoId = null
    this.#videoData = null
    this.#extraVideoDataList = []
    this.#slotsManager = null
  }

  get videoId() {
    return this.#videoId
  }

  get slotsManager() {
    return this.#slotsManager
  }

  get videoData() {
    return this.#videoData
  }
  set videoData(value) {
    this.#videoData = value
  }

  get extraVideoDataList() {
    return this.#extraVideoDataList
  }
  set extraVideoDataList(value) {
    this.#extraVideoDataList = value
  }
})()
