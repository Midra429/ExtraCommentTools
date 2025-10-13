import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'

import { storage } from '@/utils/storage/page'
import { SlotsManager } from '@/core/slots'

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
  #slotsManager: SlotsManager | null = null

  get videoId() {
    return this.#videoId
  }
  get videoData() {
    return this.#videoData
  }
  get extraVideoDataList() {
    return this.#extraVideoDataList
  }
  get slotsManager() {
    return this.#slotsManager
  }

  async initialize(videoId: string) {
    if (this.#videoId === videoId) return

    this.clear()

    this.#videoId = videoId
    this.#slotsManager = new SlotsManager(videoId, storage)

    await this.#slotsManager.initialize()
    await this.#slotsManager.remove({ isManual: false })
  }

  clear() {
    this.#videoId = null
    this.#videoData = null
    this.#extraVideoDataList = []
    this.#slotsManager = null
  }

  setVideoData(videoData: VideoData) {
    this.#videoData = videoData
  }
})()
