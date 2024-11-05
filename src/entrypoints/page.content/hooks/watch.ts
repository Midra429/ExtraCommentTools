import type {
  VideoResponse,
  VideoData,
  ThreadId,
} from '@midra/nco-api/types/niconico/video'
import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type { FetchProxyApplyArguments } from '..'

import { ncoParser } from '@midra/nco-parser'
import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'
import { extractMainThread } from '@/utils/api/extractMainThread'
import { extractExtraThread } from '@/utils/api/extractExtraThread'
import { utilsMessagingPage } from '@/utils/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-api/page'

import { hooksSharedData } from '.'

const buildSearchQueryInput = (
  rawText: string,
  duration: number
): BuildSearchQueryInput => {
  const extracted = ncoParser.extract(
    ncoParser.normalizeAll(rawText, {
      adjust: {
        letterCase: false,
      },
      remove: {
        space: false,
      },
    })
  )

  return {
    rawText,
    title: extracted.title ?? undefined,
    seasonText: extracted.season?.text,
    seasonNumber: extracted.season?.number,
    episodeText: extracted.episode?.text,
    episodeNumber: extracted.episode?.number,
    subtitle: extracted.subtitle ?? undefined,
    duration,
  }
}

const filterEasyComment = ({ comment }: VideoData) => {
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
  logger.log('---------------------------------------')
  logger.log('hookWatch()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  const videoId = url.pathname.split('/').at(-1)!

  await hooksSharedData.initialize(videoId)

  const { slotsManager } = hooksSharedData

  await slotsManager?.remove({ isManual: false })

  await utilsMessagingPage.sendMessage('setBadge', {
    text: null,
  })

  // 設定
  const showExtra = await settings.get('settings:comment:showExtra')
  const mergeExtra = await settings.get('settings:comment:mergeExtra')
  const showEasy = await settings.get('settings:comment:showEasy')
  const searchTargets = await settings.get('settings:autoLoad:searchTargets')

  try {
    const res = await Reflect.apply(...args)
    const json: VideoResponse = await res.json()

    logger.log(apiLogName, json)

    if (json.meta.status === 200) {
      const videoData = json.data.response as VideoData
      const { channel, comment, video } = videoData

      // かんたんコメントを非表示
      if (!showEasy) {
        filterEasyComment(videoData)
      }

      // スレッド (メイン)
      const mainThread = extractMainThread(videoData)
      // スレッド (引用)
      const extraThread = extractExtraThread(videoData)

      const stockVideoIds = new Set(
        videoData.comment.threads.map((v) => v.videoId)
      )

      // レイヤー (メイン)
      const mainLayerIdx = comment.layers.findIndex((layer) => {
        return layer.threadIds.some((val) => {
          return mainThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })
      })
      // レイヤー (引用)
      let extraLayerIdx = comment.layers.findIndex((layer) => {
        return layer.threadIds.some((val) => {
          return extraThread.forkIds.includes(`${val.forkLabel}:${val.id}`)
        })
      })

      if (extraLayerIdx === -1) {
        extraLayerIdx = comment.layers.length

        comment.layers.push({
          index: extraLayerIdx,
          isTranslucent: true,
          threadIds: [],
        })
      }

      // 引用コメントを表示
      if (showExtra) {
        const slots = await slotsManager?.get()
        const manualVideoIds = new Set(slots?.map((slot) => slot.id))

        const isDAnime = channel?.id === `ch${DANIME_CHANNEL_ID}`
        const isOfficial = !isDAnime && !!channel?.isOfficialAnime

        const searchedVideoIds = new Set<string>()

        // dアニメ
        if (isDAnime && searchTargets.includes('official')) {
          // 検索 (公式)
          const searchResults = await ncoApiProxy.search({
            input: buildSearchQueryInput(video.title, video.duration),
            options: {
              official: true,
              userAgent: EXT_USER_AGENT,
            },
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
        else if (isOfficial && searchTargets.includes('danime')) {
          // 関連付けられたdアニメの動画
          const dAnimeLink = await ncoApiProxy.niconico.channelVideoDAnimeLinks(
            video.id
          )

          logger.log('niconico.channelVideoDAnimeLinks', dAnimeLink)

          if (dAnimeLink) {
            searchedVideoIds.add(dAnimeLink.linkedVideoId)
          } else {
            // 検索 (dアニメ)
            const searchResults = await ncoApiProxy.search({
              input: buildSearchQueryInput(video.title, video.duration),
              options: {
                danime: true,
                userAgent: EXT_USER_AGENT,
              },
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
        const videoDataList = (
          await ncoApiProxy.niconico.multipleVideo([
            ...new Set([
              ...extraThread.videoIds,
              ...searchedVideoIds,
              ...manualVideoIds,
            ]),
          ])
        ).filter((v) => v !== null)

        // 引用動画情報を追加
        videoDataList.forEach((videoData) => {
          // かんたんコメントを非表示
          if (!showEasy) {
            filterEasyComment(videoData)
          }

          const videoId = videoData.video.id

          const isStock = stockVideoIds.has(videoId)
          const isAuto = searchedVideoIds.has(videoId)
          const isManual = manualVideoIds.has(videoId)

          if (!isStock) {
            const { threads, forkIds } = extractMainThread(videoData)

            threads.forEach((val) => {
              if (!val.label.startsWith('extra-')) {
                val.label = `extra-${val.label}` as any
              }
              val.isDefaultPostTarget = false
              val.isEasyCommentPostTarget = false
              val.postkeyStatus = 0
            })

            comment.threads.push(...threads)

            comment.layers[extraLayerIdx].threadIds.push(
              ...threads.map<ThreadId>((val) => {
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
                return forkIds.includes(`${val.fork}:${val.id}`)
              })
          }

          hooksSharedData.extraVideoDataList.push({
            ...videoData,
            _ect: { isStock, isAuto, isManual },
          })
        })

        // 引用コメントのレイヤーをメインに統合
        if (mergeExtra) {
          if (mainLayerIdx !== -1) {
            comment.layers[mainLayerIdx].threadIds.push(
              ...comment.layers[extraLayerIdx].threadIds
            )
            comment.layers.splice(extraLayerIdx, 1)
          }
        }

        // バッジを設定
        const extraCount = videoDataList.length

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

      // 空のレイヤーを削除
      comment.layers = comment.layers.filter((v) => v.threadIds.length)

      hooksSharedData.videoData = videoData
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
