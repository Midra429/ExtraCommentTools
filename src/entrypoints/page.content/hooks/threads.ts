import type { ThreadsV1RequestBody } from '@midra/nco-utils/api/services/niconico/threads/v1'
import type * as ThreadsV1 from '@midra/nco-utils/types/api/niconico/threads/v1'
import type { FetchProxyApplyArguments } from '..'

import { COLOR_CODE_REGEXP, NICONICO_COLOR_COMMANDS } from '@/constants'
import { SETTINGS_DEFAULT } from '@/constants/settings/default'
import { logger } from '@/utils/logger'
import { findAssistedCommentIds } from '@/utils/api/findAssistedCommentIds'
import { watchResponseToSlot } from '@/utils/api/watchResponseToSlot'
import { settings } from '@/utils/settings/page'
import { sendPageMessage } from '@/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-utils/api/page'

import { shared } from '.'

const JSON_REGEXP = /^{.*}$/

function isResponseOk(json: ThreadsV1.Response): json is ThreadsV1.ResponseOk {
  return json.meta.status === 200
}

export async function hookThreads(
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> {
  const { targetWatchResponse, extraWatchResponseList, slotsManager } = shared

  if (!targetWatchResponse || !slotsManager) {
    return null
  }

  logger.log('hookThreads()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  const body: ThreadsV1RequestBody | null =
    typeof init?.body === 'string' && JSON_REGEXP.test(init.body)
      ? JSON.parse(init.body)
      : null

  try {
    const res = await Reflect.apply(...args)
    const json: ThreadsV1.Response = await res.json()

    logger.log(apiLogName, json)

    if (isResponseOk(json)) {
      const threadsData = json.data
      const { globalComments, threads } = threadsData

      // 設定
      const mergeExtra = await settings.get('comment:mergeExtra')
      const translucentExtra = await settings.get('comment:translucentExtra')
      const extraColor = await settings.get('comment:extraColor')
      const forceExtraColor = await settings.get('comment:forceExtraColor')
      const hideAssistedComments = await settings.get(
        'comment:hideAssistedComments'
      )

      const slots = await slotsManager?.get()

      // 追加された動画情報
      const addedWatchResponseList = extraWatchResponseList.filter(
        (res) => !res._ect.isStock
      )

      // コメント取得 (引用)
      const threadsDataList = await Promise.all(
        addedWatchResponseList.map((res) => {
          return ncoApiProxy.niconico.threads(res, body?.additionals)
        })
      )

      for (const threadsData of threadsDataList) {
        if (!threadsData) continue

        globalComments.push(...threadsData.globalComments)
        threads.push(...threadsData.threads)
      }

      let cmtCnt = 0
      let assistedCmtCnt = 0

      // オフセット・コマンド適用
      for (const thread of threads) {
        const forkId = `${thread.fork}:${thread.id}`
        let videoId: string | undefined

        switch (targetWatchResponse.type) {
          case 'v3':
          case 'v4': {
            videoId = targetWatchResponse.rawData.comment.threads.find(
              (thread) => {
                return `${thread.forkLabel}:${thread.id}` === forkId
              }
            )?.videoId
          }
        }

        const slot = slots?.find((slot) => slot.id === videoId)

        const offsetMs = slot?.offsetMs ?? 0
        const commands = slot?.commands ?? []

        const isExtra = extraWatchResponseList.some(
          (res) => res.data.video.id === videoId
        )
        let hasCustomColor = false

        // 統合済みだと半透明レイヤーじゃないので
        if (isExtra && mergeExtra && translucentExtra) {
          commands.push('_live')
        }

        // 引用コメントの色
        if (
          isExtra &&
          COLOR_CODE_REGEXP.test(extraColor) &&
          extraColor !== SETTINGS_DEFAULT['comment:extraColor']
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
      const loadedThreadForkIds = threads.map(
        (thread) => `${thread.fork}:${thread.id}`
      )

      const loadedWatchResponseList = extraWatchResponseList.filter(
        ({ type, rawData }) => {
          switch (type) {
            case 'v3':
            case 'v4': {
              return rawData.comment.threads.some((thread) => {
                return loadedThreadForkIds.includes(
                  `${thread.forkLabel}:${thread.id}`
                )
              })
            }
          }
        }
      )

      // スロットに追加
      for (const res of loadedWatchResponseList) {
        const newSlot = watchResponseToSlot(res)
        const oldSlot = slots?.find((slot) => slot.id === newSlot.id)

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
      const count = loadedWatchResponseList.length

      await sendPageMessage('content:setBadge', {
        text: count ? count.toString() : null,
        color: 'green',
      })
    } else {
      await sendPageMessage('content:setBadge', {
        text: null,
      })
    }

    return new Response(JSON.stringify(json), {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    })
  } catch (err) {
    await sendPageMessage('content:setBadge', {
      text: null,
    })

    logger.error(apiLogName, err)
  }

  return null
}
