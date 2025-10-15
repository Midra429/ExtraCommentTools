import type {
  VideoData,
  Thread,
} from '@midra/nco-utils/types/api/niconico/video'

function filterMainThreads(threads: Thread[]) {
  return threads.filter((val) => {
    return val.isDefaultPostTarget || val.isEasyCommentPostTarget
  })
}

function filterExtraThreads(threads: Thread[]) {
  return threads.filter((val) => {
    return val.label.startsWith('extra-')
  })
}

export function extractThread(target: 'main' | 'extra', videoData: VideoData) {
  const threads =
    target === 'main'
      ? filterMainThreads(videoData.comment.threads)
      : filterExtraThreads(videoData.comment.threads)
  const forkIds = threads.map((val) => {
    return `${val.forkLabel}:${val.id}`
  })
  const videoIds = [...new Set(threads.map((v) => v.videoId))]

  return { threads, forkIds, videoIds }
}
