import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'
import type * as WatchV3 from '@midra/nco-utils/types/api/niconico/watch/v3'
import type * as WatchV4 from '@midra/nco-utils/types/api/niconico/watch/v4'

export function filterEasyComment({ type, data, rawData }: WatchResponse) {
  data.comment.threads = data.comment.threads.filter((thread) => {
    return thread.forkLabel !== 'easy'
  })

  for (const layer of data.comment.layers) {
    layer.components = layer.components.filter((comp) => {
      return comp.forkLabel !== 'easy'
    })
  }

  switch (type) {
    case 'v3':
    case 'v4': {
      rawData.comment.threads = rawData.comment.threads.filter((thread) => {
        return thread.forkLabel !== 'easy'
      }) as WatchV3.CommentThread[] | WatchV4.CommentThread[]

      rawData.comment.nvComment.params.targets =
        rawData.comment.nvComment.params.targets.filter((target) => {
          return target.fork !== 'easy'
        })

      if (type === 'v3') {
        for (const layer of rawData.comment.layers) {
          layer.threadIds = layer.threadIds.filter((thread) => {
            return thread.forkLabel !== 'easy'
          })
        }
      } else {
        for (const layer of rawData.comment.layers) {
          layer.components = layer.components.filter((comp) => {
            return comp.forkLabel !== 'easy'
          })
        }
      }

      break
    }
  }
}
