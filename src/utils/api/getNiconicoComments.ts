import type { VideoData } from '@midra/nco-api/types/niconico/video'
import type { ThreadsData } from '@midra/nco-api/types/niconico/threads'
import type { ThreadsRequestBody } from '@midra/nco-api/niconico/threads'

import { KAWAII_REGEXP } from '@/constants'

import { filterNvComment } from '@/utils/api/filterNvComment'
import { ncoApiProxy } from '@/proxy/nco-api/page'

export type GetNiconicoCommentsArg = {
  videoId?: string
  videoData?: VideoData
  exclude?: {
    easy?: boolean
    extra?: boolean
  }
  additionals?: ThreadsRequestBody['additionals']
}

export type GetNiconicoCommentsResult = {
  videoData: VideoData
  threadsData: ThreadsData
  kawaiiCount: number
}

/**
 * ニコニコ動画のコメント取得
 */
export const getNiconicoComments = async (
  args: GetNiconicoCommentsArg[]
): Promise<(GetNiconicoCommentsResult | null)[]> => {
  // 動画情報取得
  const videoDataList = await Promise.all(
    args.map(({ videoId, videoData }) => {
      return videoData ?? (videoId ? ncoApiProxy.niconico.video(videoId) : null)
    })
  )

  // コメント取得
  const threadsDataList = await Promise.all(
    videoDataList.map(async (data, idx) => {
      if (!data) return null

      const nvComment = filterNvComment(data.comment, args[idx].exclude)

      return ncoApiProxy.niconico.threads(nvComment, args[idx].additionals)
    })
  )

  return threadsDataList.map<GetNiconicoCommentsResult | null>(
    (threadsData, idx) => {
      if (!threadsData) return null

      const videoData = videoDataList[idx]!

      const kawaiiCount = threadsData.threads
        .map((thread) => {
          return thread.comments.filter((cmt) => {
            return KAWAII_REGEXP.test(cmt.body)
          }).length
        })
        .reduce((prev, current) => prev + current, 0)

      return { videoData, threadsData, kawaiiCount }
    }
  )
}
