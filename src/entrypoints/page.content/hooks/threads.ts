import type {
  V1Threads,
  V1ThreadsOk,
} from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { ThreadsRequestBody } from '@midra/nco-utils/api/services/niconico/v1'
import type { FetchProxyApplyArguments } from '..'

import { NICONICO_COLOR_COMMANDS, COLOR_CODE_REGEXP } from '@/constants'
import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'
import { utilsMessagingPage } from '@/utils/messaging/page'
import { videoDataToSlot } from '@/utils/api/videoDataToSlot'
import { findAssistedCommentIds } from '@/utils/api/findAssistedCommentIds'
import { ncoApiProxy } from '@/proxy/nco-utils/api/page'

import { shared } from '.'

function isResponseOk(json: V1Threads): json is V1ThreadsOk {
  return json.meta.status === 200
}

export async function hookThreads(
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> {
  const { targetVideoData, extraVideoDataList, slotsManager } = shared

  if (!targetVideoData || !slotsManager) {
    return null
  }

  logger.log('hookThreads()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  const body: ThreadsRequestBody | null =
    typeof init?.body === 'string' && /^{.*}$/.test(init.body)
      ? JSON.parse(init.body)
      : null

  try {
    const res = await Reflect.apply(...args)
    const json: V1Threads = await res.json()

    logger.log(apiLogName, json)

    if (isResponseOk(json)) {
      const threadsData = json.data
      const { globalComments, threads } = threadsData

      // 設定
      const mergeExtra = await settings.get('settings:comment:mergeExtra')
      const translucentExtra = await settings.get(
        'settings:comment:translucentExtra'
      )
      const extraColor = await settings.get('settings:comment:extraColor')
      const forceExtraColor = await settings.get(
        'settings:comment:forceExtraColor'
      )
      const hideAssistedComments = await settings.get(
        'settings:comment:hideAssistedComments'
      )

      const slots = await slotsManager?.get()

      // 追加された動画情報
      const addedVideoDataList = extraVideoDataList.filter(
        (v) => !v._ect.isStock
      )

      // コメント取得 (引用)
      const threadsDataList = await ncoApiProxy.niconico.v1.multipleThreads(
        addedVideoDataList.map((v) => v.comment),
        body?.additionals
      )

      for (const data of threadsDataList) {
        if (!data) continue

        globalComments.push(...data.globalComments)
        threads.push(...data.threads)
      }

      let cmtCnt = 0
      let assistedCmtCnt = 0

      // オフセット・コマンド適用
      for (const thread of threads) {
        const forkId = `${thread.fork}:${thread.id}`
        const videoId = targetVideoData.comment.threads.find(
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
          extraColor !== SETTINGS_DEFAULT['settings:comment:extraColor']
        ) {
          commands.push(extraColor)

          hasCustomColor = true
        }

        // コメントアシストの表示を抑制
        const assistedCommentIds = hideAssistedComments
          ? findAssistedCommentIds(thread.comments)
          : null

        cmtCnt += thread.comments.length
        assistedCmtCnt += assistedCommentIds?.length ?? 0

        if (assistedCommentIds?.length) {
          thread.comments = thread.comments.filter(
            (cmt) => !assistedCommentIds.includes(cmt.id)
          )
        }

        for (const cmt of thread.comments) {
          cmt.vposMs += offsetMs

          if (commands.length) {
            let tmpCommands = commands

            if (hasCustomColor) {
              // 引用コメントの色を強制
              if (forceExtraColor) {
                cmt.commands = cmt.commands.filter((command) => {
                  return (
                    !NICONICO_COLOR_COMMANDS.includes(command) &&
                    !COLOR_CODE_REGEXP.test(command)
                  )
                })
              } else {
                const hasColorCommand = cmt.commands.some((command) => {
                  return (
                    NICONICO_COLOR_COMMANDS.includes(command) ||
                    COLOR_CODE_REGEXP.test(command)
                  )
                })

                // カラーコマンド優先
                if (hasColorCommand) {
                  tmpCommands = commands.filter((command) => {
                    return (
                      !NICONICO_COLOR_COMMANDS.includes(command) &&
                      !COLOR_CODE_REGEXP.test(command)
                    )
                  })
                }
              }

              // isPremiumじゃないと一部カラーコマンドが使えない
              cmt.isPremium = true
            }

            cmt.commands = [...new Set([...cmt.commands, ...tmpCommands])]
          }
        }
      }

      if (hideAssistedComments) {
        logger.log('assistedComment', `${assistedCmtCnt} / ${cmtCnt}`)
      }

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
      const count = loadedVideoDataList.length

      await utilsMessagingPage.sendMessage('setBadge', {
        text: count ? count.toString() : null,
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
    await utilsMessagingPage.sendMessage('setBadge', {
      text: null,
    })

    logger.error(apiLogName, err)
  }

  return null
}
