import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'

import { SlotsManager } from '@/core/slots'
import { storage } from '@/utils/storage/page'

export type ExtraWatchResponse = WatchResponse & {
  _ect: {
    isStock: boolean
    isAuto: boolean
    isManual: boolean
  }
}

export const shared = new (class Shared {
  #videoId: string | null = null
  #targetWatchResponse: WatchResponse | null = null
  #extraWatchResponseList: ExtraWatchResponse[] = []
  #slotsManager: SlotsManager | null = null

  get videoId() {
    return this.#videoId
  }
  get targetWatchResponse() {
    return this.#targetWatchResponse
  }
  get extraWatchResponseList() {
    return this.#extraWatchResponseList
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
    this.#targetWatchResponse = null
    this.#extraWatchResponseList = []
    this.#slotsManager = null
  }

  setTargetVideoData(watchResponse: WatchResponse) {
    this.#targetWatchResponse = watchResponse
  }

  addExtraWatchResponse(...responses: ExtraWatchResponse[]) {
    this.#extraWatchResponseList.push(...responses)
  }
})()
