import type { VideoData } from '@midra/nco-api/types/niconico/video'

export const extractExtraThread = (videoData: VideoData) => {
  const threads = videoData.comment.threads.filter((val) => {
    return val.label.startsWith('extra-')
  })
  const forkIds = threads.map((val) => {
    return `${val.forkLabel}:${val.id}`
  })
  const videoIds = [...new Set(threads.map((v) => v.videoId))]

  return { threads, forkIds, videoIds }
}
