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

export const shared = new (class Shared {
  #videoId: string | null = null
  #targetVideoData: VideoData | null = null
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

  setTargetVideoData(videoData: VideoData) {
    this.#targetVideoData = videoData
  }

  addExtraVideoData(...data: ExtraVideoData[]) {
    this.#extraVideoDataList.push(...data)
  }
})()
