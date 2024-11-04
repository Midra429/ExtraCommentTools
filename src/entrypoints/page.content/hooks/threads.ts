import type {
  Threads,
  ThreadsData,
} from '@midra/nco-api/types/niconico/threads'
import type { ThreadsRequestBody } from '@midra/nco-api/niconico/threads'
import type { FetchProxyApplyArguments } from '..'

import { logger } from '@/utils/logger'
import { videoDataToSlot } from '@/utils/api/videoDataToSlot'
import { ncoApiProxy } from '@/proxy/nco-api/page'

import { hooksSharedData } from '.'

export const hookThreads = async (
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> => {
  const { videoData, extraVideoDataList, slotsManager } = hooksSharedData

  if (!videoData || !extraVideoDataList.length || !slotsManager) {
    return null
  }

  logger.log('hookThreads()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  const body: ThreadsRequestBody | null =
    typeof init?.body === 'string' && /^{.*}$/.test(init.body)
      ? JSON.parse(init.body)
      : null

  if (!body) {
    return null
  }

  try {
    const res = await Reflect.apply(...args)
    const json: Threads = await res.json()

    logger.log(apiLogName, json)

    if (json.meta.status === 200) {
      const threadsData = json.data as ThreadsData
      const { globalComments, threads } = threadsData

      // 追加された動画情報
      const addedVideoDataList = extraVideoDataList.filter(({ _ect }) => {
        return !_ect.isStock
      })

      // コメント取得 (引用)
      const threadsDataList = (
        await ncoApiProxy.niconico.multipleThreads(
          addedVideoDataList.map((v) => v.comment.nvComment),
          body.additionals
        )
      ).filter((v) => v !== null)

      threadsDataList.forEach((threadsData) => {
        globalComments.push(...threadsData.globalComments)
        threads.push(...threadsData.threads)
      })

      const slots = await slotsManager?.get()

      // オフセット適用
      slots?.forEach((slot) => {
        const offsetMs = slot.offsetMs

        if (!offsetMs) return

        const forkIds = videoData.comment.threads
          .filter((v) => v.videoId === slot.id)
          .map((v) => `${v.forkLabel}:${v.id}`)

        threads
          .filter((v) => forkIds.includes(`${v.fork}:${v.id}`))
          .forEach((thread) => {
            thread.comments.forEach((cmt) => {
              cmt.vposMs += offsetMs
            })
          })
      })

      // 読み込み済みの動画情報
      const loadedThreadForkIds = threads.map((v) => `${v.fork}:${v.id}`)

      const loadedVideoDataList = extraVideoDataList.filter(({ comment }) => {
        return comment.threads.some((val) => {
          return loadedThreadForkIds.includes(`${val.forkLabel}:${val.id}`)
        })
      })

      // スロットに追加
      for (const data of loadedVideoDataList) {
        const oldSlot = slots?.find((v) => v.id === data.video.id)
        const newSlot = videoDataToSlot(data, {
          isStock: !!data._ect.isStock,
          isAuto: !!data._ect.isAuto,
          isManual: !!data._ect.isManual,
        })

        if (oldSlot) {
          await slotsManager.update({
            id: oldSlot.id,
            info: newSlot.info,
          })
        } else {
          await slotsManager.add(newSlot)
        }
      }
    }

    return new Response(JSON.stringify(json), {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    })
  } catch (err) {
    logger.log(apiLogName, err)
  }

  return null
}
