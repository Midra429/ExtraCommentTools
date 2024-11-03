import { defineContentScript } from 'wxt/sandbox'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'

import { hookWatch } from './hooks/watch'
import { hookThreads } from './hooks/threads'
// import { hookNicorus } from './hooks/nicorus'

export type FetchProxyApplyArguments<IsHook extends boolean = false> = [
  target: Window['fetch'],
  thisArg: unknown,
  argArray:
    | (IsHook extends false ? Parameters<Window['fetch']> : never)
    | (IsHook extends true ? [input: URL, init: RequestInit] : never),
]

export default defineContentScript({
  matches: MATCHES,
  runAt: 'document_start',
  world: 'MAIN',
  main: () => {
    logger.log('page.js')

    window.fetch = new Proxy(window.fetch, {
      apply: async (
        ...[target, thisArg, argArray]: FetchProxyApplyArguments
      ) => {
        if (argArray[0] instanceof Request) {
          return Reflect.apply(target, thisArg, argArray)
        }

        if (typeof argArray[0] === 'string') {
          argArray[0] = /^https?:\/\//.test(argArray[0])
            ? new URL(argArray[0])
            : new URL(argArray[0], location.origin)
        }

        argArray[1] ??= {}
        argArray[1].method ??= 'GET'

        const args = [
          target,
          thisArg,
          argArray,
        ] as FetchProxyApplyArguments<true>

        const [url, init] = argArray

        let response: Response | null = null

        if (init.method === 'GET') {
          // 動画情報API
          if (
            url.pathname.startsWith('/watch/') &&
            url.searchParams.get('responseType') === 'json'
          ) {
            response = await hookWatch(args)
          }
        }

        if (init.method === 'POST') {
          // コメント取得API
          if (url.pathname === '/v1/threads') {
            response = await hookThreads(args)
          }

          // ニコるAPI
          // if (
          //   url.pathname.startsWith('/v1/threads') &&
          //   url.pathname.endsWith('/nicorus')
          // ) {
          //   response = await hookNicorus(args)
          // }
        }

        if (response) {
          return response
        } else {
          try {
            return await Reflect.apply(...args)
          } catch (err) {
            console.log(err)
          }
        }
      },
    })
  },
})
