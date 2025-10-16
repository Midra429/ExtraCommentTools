import type {
  VideoResponse,
  VideoData,
  ThreadId,
} from '@midra/nco-utils/types/api/niconico/video'
import type { SearchTarget } from '@midra/nco-utils/types/search'
import type { FetchProxyApplyArguments } from '..'

import { DANIME_CHANNEL_ID } from '@midra/nco-utils/search/constants'
import { parse } from '@midra/nco-utils/parse'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'
import { extractThread } from '@/utils/api/extractThread'
import { utilsMessagingPage } from '@/utils/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-utils/api/page'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/page'

import { hooksSharedData } from '.'

function filterEasyComment({ comment }: VideoData) {
  comment.threads = comment.threads.filter((val) => {
    return val.forkLabel !== 'easy'
  })

  comment.layers.forEach((layer) => {
    layer.threadIds = layer.threadIds.filter((val) => {
      return val.forkLabel !== 'easy'
    })
  })

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

  await utilsMessagingPage.sendMessage('setBadge', {
    text: null,
  })

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  // 共有データをクリア
  hooksSharedData.clear()

  try {
    const res = await Reflect.apply(...args)
    const json: VideoResponse = await res.json()

    logger.log(apiLogName, json)

    if (json.meta.status === 200) {
      const videoData = json.data.response as VideoData
      const { channel, comment, video } = videoData

      // URLのIDを動画情報のIDに置き換える
      if (url.pathname.split('/').at(-1) !== video.id) {
        const newPath = url.pathname.replace(/[^\/]+$/, video.id)

        history.replaceState(null, '', newPath)
      }

      // 共有データを初期化
      await hooksSharedData.initialize(video.id)

      // タイトルを解析
      const parsed = parse(video.title)

      logger.log('parsed', parsed)

      // 設定
      const showExtra = await settings.get('settings:comment:showExtra')
      const mergeExtra = await settings.get('settings:comment:mergeExtra')
      const translucentExtra = await settings.get(
        'settings:comment:translucentExtra'
      )
      const showEasy = await settings.get('settings:comment:showEasy')
      const searchTargets = await settings.get(
        'settings:autoLoad:searchTargets'
      )

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
        return layer.threadIds.some((val) => {
          return mainThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })
      })

      if (mainLayerIdx === -1) {
        mainLayerIdx = comment.layers.length

        comment.layers.push({
          index: mainLayerIdx,
          isTranslucent: true,
          threadIds: [],
        })
      }

      // 引用レイヤー
      let extraLayerIdx = comment.layers.findIndex((layer) => {
        return layer.threadIds.some((val) => {
          return extraThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })
      })

      // 引用レイヤーがなければ作る
      if (extraLayerIdx === -1) {
        extraLayerIdx = comment.layers.length

        comment.layers.push({
          index: extraLayerIdx,
          isTranslucent: true,
          threadIds: [],
        })
      }

      // 引用レイヤーを半透明化
      comment.layers[extraLayerIdx].isTranslucent = translucentExtra

      // 引用コメントを表示
      if (showExtra) {
        const slots = await hooksSharedData.slotsManager?.get()
        const manualVideoIds = new Set(slots?.map((slot) => slot.id))

        const isDAnime = channel?.id === `ch${DANIME_CHANNEL_ID}`
        const isOfficial = !isDAnime && !!channel?.isOfficialAnime

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

          logger.log('niconico.search', searchDataList)

          searchDataList.forEach((data) => {
            searchedVideoIds.add(data.contentId)
          })
        }
        // 公式
        else if (isOfficial && (targets.official || targets.danime)) {
          // 関連付けられたdアニメの動画
          const dAnimeLink = targets.danime
            ? await ncoApiProxy.niconico.channelVideoDAnimeLinks(video.id)
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

            logger.log('niconico.search', searchDataList)

            searchDataList.forEach((data) => {
              searchedVideoIds.add(data.contentId)
            })
          }
        }

        // 引用動画情報を取得
        const extraVideoDataList = (
          await ncoApiProxy.niconico.multipleVideo([
            ...new Set([
              ...extraThread.videoIds,
              ...searchedVideoIds,
              ...manualVideoIds,
            ]),
          ])
        ).filter((v) => v !== null)

        // 引用動画情報を追加
        extraVideoDataList.forEach((videoData) => {
          // かんたんコメントを非表示
          if (!showEasy) {
            filterEasyComment(videoData)
          }

          const videoId = videoData.video.id

          const isStock = stockVideoIds.has(videoId)
          const isAuto = searchedVideoIds.has(videoId)
          const isManual = manualVideoIds.has(videoId)

          if (!isStock) {
            const mainThread = extractThread('main', videoData)

            mainThread.threads.forEach((val) => {
              if (!val.label.startsWith('extra-')) {
                val.label = `extra-${val.label}` as any
              }
              val.isDefaultPostTarget = false
              val.isEasyCommentPostTarget = false
              val.postkeyStatus = 0
            })

            comment.threads.push(...mainThread.threads)

            comment.layers[extraLayerIdx].threadIds.push(
              ...mainThread.threads.map<ThreadId>((val) => {
                return {
                  id: val.id,
                  fork: val.fork,
                  forkLabel: val.forkLabel,
                }
              })
            )

            // メインのスレッドのみ
            videoData.comment.nvComment.params.targets =
              videoData.comment.nvComment.params.targets.filter((val) => {
                return mainThread.forkIds.includes(`${val.fork}:${val.id}`)
              })
          }

          hooksSharedData.extraVideoDataList.push({
            ...videoData,
            _ect: { isStock, isAuto, isManual },
          })
        })

        // 引用コメントのレイヤーをメインに統合
        if (mergeExtra) {
          comment.layers[mainLayerIdx].threadIds.push(
            ...comment.layers[extraLayerIdx].threadIds
          )

          delete comment.layers[extraLayerIdx]
        }

        // バッジを設定
        const extraCount = extraVideoDataList.length

        if (extraCount) {
          await utilsMessagingPage.sendMessage('setBadge', {
            text: extraCount.toString(),
            color: 'yellow',
          })
        }
      }
      // 引用コメントを非表示
      else {
        comment.threads = comment.threads.filter((val) => {
          return !extraThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })

        comment.layers.forEach((layer) => {
          layer.threadIds = layer.threadIds.filter((val) => {
            return !extraThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
          })
        })

        comment.nvComment.params.targets =
          comment.nvComment.params.targets.filter((val) => {
            return !extraThread.forkIds.includes(`${val.fork}:${val.id}`)
          })
      }

      // 空のレイヤーを削除 & 一応並び替え
      comment.layers = comment.layers
        .filter((v) => v.threadIds.length)
        .sort((a, b) => a.index - b.index)

      hooksSharedData.slotsManager?.setParsedResult(parsed)
      hooksSharedData.setVideoData(videoData)
    }

    return new Response(JSON.stringify(json), {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    })
  } catch (err) {
    logger.error(apiLogName, err)
  }

  return null
}
