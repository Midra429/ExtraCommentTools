import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'
import type * as WatchV3 from '@midra/nco-utils/types/api/niconico/watch/v3'
import type * as WatchV4 from '@midra/nco-utils/types/api/niconico/watch/v4'

export function extractThread(
  target: 'main' | 'extra',
  { type, rawData }: WatchResponse
) {
  switch (type) {
    case 'v3': {
      let threads: WatchV3.CommentThread[]

      // メイン
      if (target === 'main') {
        const postTarget = rawData.comment.threads.find(
          (thread) => thread.isDefaultPostTarget
        )
        threads = rawData.comment.threads.filter(
          (thread) => thread.id === postTarget?.id
        )
      }
      // 引用
      else {
        threads = rawData.comment.threads.filter((thread) => {
          return thread.label.startsWith('extra-')
        })
      }

      const forkIds = threads.map((thread) => {
        return `${thread.forkLabel}:${thread.id}`
      })
      const videoIds = [...new Set(threads.map((thread) => thread.videoId))]

      return { type, threads, forkIds, videoIds }
    }

    case 'v4': {
      let threads: WatchV4.CommentThread[]

      // メイン
      if (target === 'main') {
        const postTarget = rawData.comment.threads.find(
          (thread) => thread.isPostTarget
        )
        threads = rawData.comment.threads.filter(
          (thread) => thread.id === postTarget?.id
        )
      }
      // 引用
      else {
        threads = rawData.comment.threads.filter((thread) => {
          return thread.label.startsWith('extra-')
        })
      }

      const forkIds = threads.map((thread) => {
        return `${thread.forkLabel}:${thread.id}`
      })
      const videoIds = [...new Set(threads.map((thread) => thread.videoId))]

      return { type, threads, forkIds, videoIds }
    }
  }
}
