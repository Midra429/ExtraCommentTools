import type {
  Threads,
  ThreadsData,
} from '@midra/nco-api/types/niconico/threads'
import type { ThreadsRequestBody } from '@midra/nco-api/niconico/threads'
import type { FetchProxyApplyArguments } from '..'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE_REGEXP } from '@/constants'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'
import { videoDataToSlot } from '@/utils/api/videoDataToSlot'
import { utilsMessagingPage } from '@/utils/messaging/page'
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

  // 設定
  const mergeExtra = await settings.get('settings:comment:mergeExtra')
  const translucentExtra = await settings.get(
    'settings:comment:translucentExtra'
  )
  const extraColor = await settings.get('settings:comment:extraColor')

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

      // オフセット・コマンド適用
      threads.forEach((thread) => {
        const forkId = `${thread.fork}:${thread.id}`
        const videoId = videoData.comment.threads.find(
          (v) => `${v.forkLabel}:${v.id}` === forkId
        )?.videoId

        const slot = slots?.find((v) => v.id === videoId)

        const offsetMs = slot?.offsetMs ?? 0
        const commands = slot?.commands ?? []

        const isExtra = extraVideoDataList.some((v) => v.video.id === videoId)
        let hasCustomColor = false

        // 統合済みだと半透明レイヤーじゃないので
        if (isExtra && mergeExtra && translucentExtra) {
          commands.push('_live')
        }

        // 引用コメントの色
        if (
          isExtra &&
          COLOR_CODE_REGEXP.test(extraColor) &&
          !/^#f{6}$/i.test(extraColor)
        ) {
          commands.push(extraColor)

          hasCustomColor = true
        }

        if (!offsetMs && !commands.length) return

        thread.comments.forEach((cmt) => {
          cmt.vposMs += offsetMs

          // デフォルトのカラーコマンド優先
          const hasColorCommand = cmt.commands.some((command) => {
            return (
              NICONICO_COLOR_COMMANDS.includes(command) ||
              COLOR_CODE_REGEXP.test(command)
            )
          })
          const filteredCommands = hasColorCommand
            ? commands.filter((command) => {
                return (
                  !NICONICO_COLOR_COMMANDS.includes(command) &&
                  !COLOR_CODE_REGEXP.test(command)
                )
              })
            : commands

          cmt.commands = [...new Set([...cmt.commands, ...filteredCommands])]

          cmt.isPremium ||= hasCustomColor
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
        const newSlot = videoDataToSlot(data)
        const oldSlot = slots?.find((v) => v.id === newSlot.id)

        if (oldSlot) {
          await slotsManager.update({
            id: oldSlot.id,
            info: newSlot.info,
          })
        } else {
          await slotsManager.add(newSlot)
        }
      }

      // バッジを設定
      const loadedCount = loadedVideoDataList.length

      await utilsMessagingPage.sendMessage('setBadge', {
        text: loadedCount ? loadedCount.toString() : null,
        color: 'green',
      })
    } else {
      await utilsMessagingPage.sendMessage('setBadge', {
        text: null,
      })
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
