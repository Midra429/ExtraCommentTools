import type {
  Component,
  VideoResponse,
  VideoResponseData,
  WatchV4Data,
} from '@midra/nco-utils/types/api/niconico/video'
import type { SearchTarget } from '@midra/nco-utils/types/search'
import type { FetchProxyApplyArguments } from '..'

import { parse } from '@midra/nco-utils/parse'
import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'

import { logger } from '@/utils/logger'
import { extractThread } from '@/utils/api/extractThread'
import { NICONICO_WATCH_PATH_REGEXP } from '@/utils/api/extractVideoId'
import { settings } from '@/utils/settings/page'
import { sendPageMessage } from '@/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-utils/api/page'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/page'

import { shared } from '.'

function filterEasyComment({ comment }: WatchV4Data) {
  comment.threads = comment.threads.filter((val) => {
    return val.forkLabel !== 'easy'
  })

  for (const layer of comment.layers) {
    layer.components = layer.components.filter((val) => {
      return val.forkLabel !== 'easy'
    })
  }

  comment.nvComment.params.targets = comment.nvComment.params.targets.filter(
    (val) => {
      return val.fork !== 'easy'
    }
  )
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
    const json: VideoResponse = await res.json()

    logger.log(apiLogName, json)

    if (json.meta.status === 200) {
      const videoData = (json.data as VideoResponseData).response.$watchV4.data
      const { comment, video, metadata, genre } = videoData

      // URLのIDを動画情報のIDに置き換える
      const videoId = url.pathname.match(NICONICO_WATCH_PATH_REGEXP)![0]

      if (videoId !== video.id) {
        const oldPath = url.pathname
        const newPath = oldPath.replace(NICONICO_WATCH_PATH_REGEXP, video.id)

        history.replaceState(null, '', newPath)

        logger.log('replace', `${oldPath} -> ${newPath}`)
      }

      // 共有データを初期化
      await shared.initialize(video.id)

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
        filterEasyComment(videoData)
      }

      // メインスレッド
      const mainThread = extractThread('main', videoData)
      // 引用スレッド
      const extraThread = extractThread('extra', videoData)

      const stockVideoIds = new Set(
        videoData.comment.threads.map((v) => v.videoId)
      )

      // メインレイヤー
      let mainLayerIdx = comment.layers.findIndex((layer) => {
        return layer.components.some((val) => {
          return mainThread.forkIds.includes(`${val.forkLabel}:${val.threadId}`)
        })
      })

      if (mainLayerIdx === -1) {
        mainLayerIdx = comment.layers.length

        comment.layers.push({
          index: mainLayerIdx,
          isTranslucent: true,
          components: [],
        })
      }

      // 引用レイヤー
      let extraLayerIdx = comment.layers.findIndex((layer) => {
        return layer.components.some((val) => {
          return extraThread.forkIds.includes(
            `${val.forkLabel}:${val.threadId}`
          )
        })
      })

      // 引用レイヤーがなければ作る
      if (extraLayerIdx === -1) {
        extraLayerIdx = comment.layers.length

        comment.layers.push({
          index: extraLayerIdx,
          isTranslucent: true,
          components: [],
        })
      }

      // 引用レイヤーを半透明化
      comment.layers[extraLayerIdx]!.isTranslucent = translucentExtra

      // タイトルを解析
      const parsed = parse(video.title)

      logger.log('parsed', parsed)

      await shared.slotsManager?.setParsedResult(parsed)

      // 引用コメントを表示
      if (showExtra) {
        const slots = await shared.slotsManager?.get()
        const manualVideoIds = new Set(slots?.map((slot) => slot.id))

        const isDAnime = metadata.jsonLd.owner.id === `ch${DANIME_CHANNEL_ID}`
        const isOfficial =
          !isDAnime &&
          metadata.jsonLd.owner.type === 'channel' &&
          (genre.key === 'anime' || genre.label === 'アニメ')

        const searchedVideoIds = new Set<string>()

        // dアニメ
        if (isDAnime && targets.official) {
          // 検索 (公式)
          const searchResults = await ncoSearchProxy.niconico({
            input: parsed,
            duration: video.duration,
            targets,
            userAgent: EXT_USER_AGENT,
          })
          const searchDataList = Object.values(searchResults)
            .flat()
            .filter((v) => !stockVideoIds.has(v.contentId))

          logger.log('ncoSearch.niconico', searchDataList)

          for (const data of searchDataList) {
            searchedVideoIds.add(data.contentId)
          }
        }
        // 公式
        else if (isOfficial && (targets.official || targets.danime)) {
          // 関連付けられたdアニメの動画
          const dAnimeLink = targets.danime
            ? await ncoApiProxy.niconico.v1.channelVideoDAnimeLinks(video.id)
            : null

          logger.log('niconico.channelVideoDAnimeLinks', dAnimeLink)

          if (dAnimeLink) {
            searchedVideoIds.add(dAnimeLink.linkedVideoId)
          } else {
            // 検索 (公式/dアニメ)
            const searchResults = await ncoSearchProxy.niconico({
              input: parsed,
              duration: video.duration,
              targets,
              userAgent: EXT_USER_AGENT,
            })
            const searchDataList = Object.values(searchResults)
              .flat()
              .filter((v) => !stockVideoIds.has(v.contentId))

            logger.log('ncoSearch.niconico', searchDataList)

            for (const data of searchDataList) {
              searchedVideoIds.add(data.contentId)
            }
          }
        }

        // 引用動画情報を取得
        const videoDataList = await ncoApiProxy.niconico.multipleVideo([
          ...new Set([
            ...extraThread.videoIds,
            ...searchedVideoIds,
            ...manualVideoIds,
          ]),
        ])

        // 引用動画情報を追加
        for (const data of videoDataList) {
          if (!data) continue

          // かんたんコメントを非表示
          if (!showEasy) {
            filterEasyComment(data)
          }

          const videoId = data.video.id

          const isStock = stockVideoIds.has(videoId)
          const isAuto = searchedVideoIds.has(videoId)
          const isManual = manualVideoIds.has(videoId)

          if (!isStock) {
            const mainThread = extractThread('main', data)

            for (const thread of mainThread.threads) {
              if (!thread.label.startsWith('extra-')) {
                thread.label = `extra-${thread.label}` as any
              }
              thread.isPostTarget = false
              thread.postNgReason = null
            }

            comment.threads.push(...mainThread.threads)

            comment.layers[extraLayerIdx]!.components.push(
              ...mainThread.threads.map<Component>((val) => {
                return {
                  threadId: val.id,
                  fork: val.fork,
                  forkLabel: val.forkLabel,
                }
              })
            )

            // メインのスレッドのみ
            data.comment.nvComment.params.targets =
              data.comment.nvComment.params.targets.filter((val) => {
                return mainThread.forkIds.includes(`${val.fork}:${val.id}`)
              })
          }

          shared.addExtraVideoData({
            ...data,
            _ect: { isStock, isAuto, isManual },
          })
        }

        // 引用コメントのレイヤーをメインに統合
        if (mergeExtra) {
          comment.layers[mainLayerIdx]!.components.push(
            ...comment.layers[extraLayerIdx]!.components
          )

          delete comment.layers[extraLayerIdx]
        }

        // バッジを設定
        const count = shared.extraVideoDataList.length

        if (count) {
          await sendPageMessage('content:setBadge', {
            text: count.toString(),
            color: 'yellow',
          })
        }
      }
      // 引用コメントを非表示
      else {
        comment.threads = comment.threads.filter((val) => {
          return !extraThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })

        for (const layer of comment.layers) {
          layer.components = layer.components.filter((val) => {
            return !extraThread.forkIds.includes(
              `${val.forkLabel}:${val.threadId}`
            )
          })
        }

        comment.nvComment.params.targets =
          comment.nvComment.params.targets.filter((val) => {
            return !extraThread.forkIds.includes(`${val.fork}:${val.id}`)
          })
      }

      // 空のレイヤーを削除 & 一応並び替え
      comment.layers = comment.layers
        .filter((v) => v.components.length)
        .sort((a, b) => a.index - b.index)

      shared.setTargetVideoData(videoData)
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
