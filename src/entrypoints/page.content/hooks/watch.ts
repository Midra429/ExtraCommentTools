import type { WatchResponse } from '@midra/nco-utils/api/services/niconico/watch'
import type * as WatchV3 from '@midra/nco-utils/types/api/niconico/watch/v3'
import type * as WatchV4 from '@midra/nco-utils/types/api/niconico/watch/v4'
import type { SearchTarget } from '@midra/nco-utils/types/search'
import type { FetchProxyApplyArguments } from '..'

import { parse } from '@midra/nco-utils/parse'
import { normalizeWatchV3Data } from '@midra/nco-utils/api/utils/niconico/watch/v3'
import { normalizeWatchV4Data } from '@midra/nco-utils/api/utils/niconico/watch/v4'
import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

import { logger } from '@/utils/logger'
import { extractThread } from '@/utils/api/extractThread'
import { NICONICO_WATCH_PATH_REGEXP } from '@/utils/api/extractVideoId'
import { filterEasyComment } from '@/utils/api/filterEasyComment'
import { settings } from '@/utils/settings/page'
import { sendPageMessage } from '@/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-utils/api/page'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/page'

import { shared } from '.'

function isResponseOk(
  json: WatchV3.Response | WatchV4.Response
): json is WatchV3.ResponseOk | WatchV4.ResponseOk {
  return json.meta.status === 200
}

function isV3Response(
  json: WatchV3.ResponseOk | WatchV4.ResponseOk
): json is WatchV3.ResponseOk {
  return 'ads' in json.data.response && 'tag' in json.data.response
}
function isV4Response(
  json: WatchV3.ResponseOk | WatchV4.ResponseOk
): json is WatchV4.ResponseOk {
  return '$watchV4' in json.data.response
}

export const hookWatch = async (
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> => {
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.log('hookWatch()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  // バッジをリセット
  await sendPageMessage('content:setBadge', {
    text: null,
  })

  // 共有データをクリア
  shared.clear()

  try {
    const res = await Reflect.apply(...args)
    const json = await res.json()

    logger.log(apiLogName, json)

    if (isResponseOk(json)) {
      let watchResponse: WatchResponse | undefined

      if (isV3Response(json)) {
        const rawData = json.data.response

        watchResponse = {
          type: 'v3',
          data: normalizeWatchV3Data(rawData),
          rawData,
        }
      } else if (isV4Response(json)) {
        const rawData = json.data.response.$watchV4.data

        watchResponse = {
          type: 'v4',
          data: normalizeWatchV4Data(rawData),
          rawData,
        }
      }

      if (!watchResponse) {
        throw new Error('未対応の形式です')
      }

      const {
        type: baseType,
        data: baseData,
        rawData: baseRawData,
      } = watchResponse

      // URLのIDを動画情報のIDに置き換える
      const videoId = url.pathname.match(NICONICO_WATCH_PATH_REGEXP)![0]

      if (videoId !== baseData.video.id) {
        const oldPath = url.pathname
        const newPath = oldPath.replace(
          NICONICO_WATCH_PATH_REGEXP,
          baseData.video.id
        )

        history.replaceState(null, '', newPath)

        logger.log('replace', `${oldPath} -> ${newPath}`)
      }

      // 共有データを初期化
      await shared.initialize(baseData.video.id)

      // 設定
      const showExtra = await settings.get('comment:showExtra')
      const mergeExtra = await settings.get('comment:mergeExtra')
      const translucentExtra = await settings.get('comment:translucentExtra')
      const showEasy = await settings.get('comment:showEasy')
      const searchTargets = await settings.get('autoLoad:searchTargets')

      const targets: {
        [key in SearchTarget]?: boolean
      } = {
        official: searchTargets.includes('official'),
        danime: searchTargets.includes('danime'),
      }

      // かんたんコメントを非表示
      if (!showEasy) {
        filterEasyComment(watchResponse)
      }

      // メインスレッド
      const { forkIds: mainForkIds } = extractThread('main', watchResponse)
      // 引用スレッド
      const { forkIds: extraForkIds, videoIds: extraVideoIds } = extractThread(
        'extra',
        watchResponse
      )

      // 元から表示されているコメントの動画ID
      const stockVideoIds = new Set(
        baseData.comment.threads.map((thread) => thread.videoId)
      )

      // メインレイヤー
      let mainLayerIdx = -1
      // 引用レイヤー
      let extraLayerIdx = -1

      switch (baseType) {
        case 'v3': {
          const baseComment = baseRawData.comment

          // メインレイヤー
          mainLayerIdx = baseComment.layers.findIndex((layer) => {
            return layer.threadIds.some((thread) => {
              return mainForkIds.includes(`${thread.forkLabel}:${thread.id}`)
            })
          })
          // メインレイヤーがなければ作る
          if (mainLayerIdx === -1) {
            mainLayerIdx = baseComment.layers.length
            baseComment.layers.push({
              index: mainLayerIdx,
              isTranslucent: true,
              threadIds: [],
            })
          }

          // 引用レイヤー
          extraLayerIdx = baseComment.layers.findIndex((layer) => {
            return layer.threadIds.some((thread) => {
              return extraForkIds.includes(`${thread.forkLabel}:${thread.id}`)
            })
          })
          // 引用レイヤーがなければ作る
          if (extraLayerIdx === -1) {
            extraLayerIdx = baseComment.layers.length
            baseComment.layers.push({
              index: extraLayerIdx,
              isTranslucent: true,
              threadIds: [],
            })
          }
          // 引用レイヤーを半透明化
          baseComment.layers[extraLayerIdx]!.isTranslucent = translucentExtra

          break
        }

        case 'v4': {
          const baseComment = baseRawData.comment

          // メインレイヤー
          mainLayerIdx = baseComment.layers.findIndex((layer) => {
            return layer.components.some((comp) => {
              return mainForkIds.includes(`${comp.forkLabel}:${comp.threadId}`)
            })
          })
          // メインレイヤーがなければ作る
          if (mainLayerIdx === -1) {
            mainLayerIdx = baseComment.layers.length
            baseComment.layers.push({
              index: mainLayerIdx,
              isTranslucent: true,
              components: [],
            })
          }

          // 引用レイヤー
          extraLayerIdx = baseComment.layers.findIndex((layer) => {
            return layer.components.some((comp) => {
              return extraForkIds.includes(`${comp.forkLabel}:${comp.threadId}`)
            })
          })
          // 引用レイヤーがなければ作る
          if (extraLayerIdx === -1) {
            extraLayerIdx = baseComment.layers.length
            baseComment.layers.push({
              index: extraLayerIdx,
              isTranslucent: true,
              components: [],
            })
          }
          // 引用レイヤーを半透明化
          baseComment.layers[extraLayerIdx]!.isTranslucent = translucentExtra

          break
        }
      }

      // タイトルを解析
      const parsed = parse(baseData.video.title)

      logger.log('parsed', parsed)

      await shared.slotsManager?.setParsedResult(parsed)

      // 引用コメントを表示
      if (showExtra) {
        const slots = await shared.slotsManager?.get()
        const manualVideoIds = new Set(slots?.map((slot) => slot.id))

        const isDAnime = baseData.channel?.id === `ch${DANIME_CHANNEL_ID}`
        const isOfficial = !isDAnime && baseData.channel?.isOfficialAnime

        const searchedVideoIds = new Set<string>()

        // dアニメ
        if (isDAnime && targets.official) {
          // 検索 (公式)
          const searchResults = await ncoSearchProxy.niconico({
            input: parsed,
            duration: baseData.video.duration,
            targets,
            userAgent: EXT_USER_AGENT,
          })
          const searchDataList = Object.values(searchResults)
            .flat()
            .filter((data) => !stockVideoIds.has(data.contentId))

          logger.log('ncoSearch.niconico', searchDataList)

          for (const data of searchDataList) {
            searchedVideoIds.add(data.contentId)
          }
        }
        // 公式
        else if (isOfficial && (targets.official || targets.danime)) {
          // 関連付けられたdアニメの動画
          const dAnimeLink = targets.danime
            ? await ncoApiProxy.niconico.channelVideoDAnimeLinksV1(
                baseData.video.id
              )
            : null

          logger.log('niconico.channelVideoDAnimeLinksV1', dAnimeLink)

          if (dAnimeLink) {
            searchedVideoIds.add(dAnimeLink.linkedVideoId)
          } else {
            // 検索 (公式/dアニメ)
            const searchResults = await ncoSearchProxy.niconico({
              input: parsed,
              duration: baseData.video.duration,
              targets,
              userAgent: EXT_USER_AGENT,
            })
            const searchDataList = Object.values(searchResults)
              .flat()
              .filter((data) => !stockVideoIds.has(data.contentId))

            logger.log('ncoSearch.niconico', searchDataList)

            for (const data of searchDataList) {
              searchedVideoIds.add(data.contentId)
            }
          }
        }

        // 引用動画情報を取得
        const addnlVideoIds = new Set([
          ...extraVideoIds,
          ...searchedVideoIds,
          ...manualVideoIds,
        ])
        const addnlWatchResponses = await Promise.all(
          addnlVideoIds.values().map((id) => ncoApiProxy.niconico.watch(id))
        )

        // 引用動画情報を追加
        for (const addnlWatchResponse of addnlWatchResponses) {
          if (!addnlWatchResponse) continue

          const {
            // type: addnlType,
            data: addnlData,
            rawData: addnlRawData,
          } = addnlWatchResponse
          const addnlVideoId = addnlData.video.id

          const isStock = stockVideoIds.has(addnlVideoId)
          const isAuto = searchedVideoIds.has(addnlVideoId)
          const isManual = manualVideoIds.has(addnlVideoId)

          // かんたんコメントを非表示
          if (!showEasy) {
            filterEasyComment(addnlWatchResponse)
          }

          if (!isStock) {
            const {
              type: addnlMainType,
              threads: addnlMainThreads,
              forkIds: addnlMainForkIds,
            } = extractThread('main', addnlWatchResponse)

            switch (addnlMainType) {
              case 'v3': {
                const baseComment = baseRawData.comment as WatchV3.Comment

                for (const thread of addnlMainThreads) {
                  if (!thread.label.startsWith('extra-')) {
                    thread.label = `extra-${thread.label}` as any
                  }
                  thread.isDefaultPostTarget = false
                  thread.isEasyCommentPostTarget = false
                  thread.postkeyStatus = 0

                  baseComment.threads.push(thread)
                }

                baseComment.layers[extraLayerIdx]!.threadIds.push(
                  ...addnlMainThreads.map<WatchV3.CommentThreadId>((thread) => {
                    return {
                      id: thread.id,
                      fork: thread.fork,
                      forkLabel: thread.forkLabel,
                    }
                  })
                )

                // メインのスレッドのみ
                addnlRawData.comment.nvComment.params.targets =
                  addnlRawData.comment.nvComment.params.targets.filter(
                    (target) => {
                      return addnlMainForkIds.includes(
                        `${target.fork}:${target.id}`
                      )
                    }
                  )

                break
              }

              case 'v4': {
                const baseComment = baseRawData.comment as WatchV4.Comment

                for (const thread of addnlMainThreads) {
                  if (!thread.label.startsWith('extra-')) {
                    thread.label = `extra-${thread.label}` as any
                  }
                  thread.isPostTarget = false
                  thread.postNgReason = null

                  baseComment.threads.push(thread)
                }

                baseComment.layers[extraLayerIdx]!.components.push(
                  ...addnlMainThreads.map<WatchV4.CommentLayerComponent>(
                    (thread) => {
                      return {
                        threadId: thread.id,
                        fork: thread.fork,
                        forkLabel: thread.forkLabel,
                      }
                    }
                  )
                )

                // メインのスレッドのみ
                addnlRawData.comment.nvComment.params.targets =
                  addnlRawData.comment.nvComment.params.targets.filter(
                    (target) => {
                      return addnlMainForkIds.includes(
                        `${target.fork}:${target.id}`
                      )
                    }
                  )

                break
              }
            }
          }

          shared.addExtraWatchResponse({
            ...addnlWatchResponse,
            _ect: { isStock, isAuto, isManual },
          })
        }

        // 引用コメントのレイヤーをメインに統合
        if (mergeExtra) {
          switch (baseType) {
            case 'v3': {
              const baseComment = baseRawData.comment

              baseComment.layers[mainLayerIdx]!.threadIds.push(
                ...baseComment.layers[extraLayerIdx]!.threadIds
              )

              delete baseComment.layers[extraLayerIdx]

              break
            }

            case 'v4': {
              const baseComment = baseRawData.comment

              baseComment.layers[mainLayerIdx]!.components.push(
                ...baseComment.layers[extraLayerIdx]!.components
              )

              delete baseComment.layers[extraLayerIdx]

              break
            }
          }
        }

        // バッジを設定
        const count = shared.extraWatchResponseList.length

        if (count) {
          await sendPageMessage('content:setBadge', {
            text: count.toString(),
            color: 'yellow',
          })
        }
      }
      // 引用コメントを非表示
      else {
        switch (baseType) {
          case 'v3': {
            const baseComment = baseRawData.comment

            baseComment.threads = baseComment.threads.filter((thread) => {
              return !extraForkIds.includes(`${thread.forkLabel}:${thread.id}`)
            })

            for (const layer of baseComment.layers) {
              layer.threadIds = layer.threadIds.filter((thread) => {
                return !extraForkIds.includes(
                  `${thread.forkLabel}:${thread.id}`
                )
              })
            }

            baseComment.nvComment.params.targets =
              baseComment.nvComment.params.targets.filter((target) => {
                return !extraForkIds.includes(`${target.fork}:${target.id}`)
              })

            break
          }

          case 'v4': {
            const baseComment = baseRawData.comment

            baseComment.threads = baseComment.threads.filter((thread) => {
              return !extraForkIds.includes(`${thread.forkLabel}:${thread.id}`)
            })

            for (const layer of baseComment.layers) {
              layer.components = layer.components.filter((comp) => {
                return !extraForkIds.includes(
                  `${comp.forkLabel}:${comp.threadId}`
                )
              })
            }

            baseComment.nvComment.params.targets =
              baseComment.nvComment.params.targets.filter((target) => {
                return !extraForkIds.includes(`${target.fork}:${target.id}`)
              })

            break
          }
        }
      }

      // 空のレイヤーを削除 & 一応並び替え
      switch (baseType) {
        case 'v3': {
          baseRawData.comment.layers = baseRawData.comment.layers
            .filter((layer) => layer.threadIds.length)
            .sort((layerA, layerB) => layerA.index - layerB.index)

          break
        }

        case 'v4': {
          baseRawData.comment.layers = baseRawData.comment.layers
            .filter((layer) => layer.components.length)
            .sort((layerA, layerB) => layerA.index - layerB.index)

          break
        }
      }

      shared.setTargetVideoData(watchResponse)
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
