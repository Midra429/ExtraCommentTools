import { defineContentScript } from '#imports'

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
  main() {
    logger.log('page.js')

    window.fetch = new Proxy(window.fetch, {
      async apply(...[target, thisArg, argArray]: FetchProxyApplyArguments) {
        const args = [
          target,
          thisArg,
          argArray,
        ] as FetchProxyApplyArguments<true>

        if (argArray[0] instanceof Request) {
          return Reflect.apply(...args)
        }

        if (typeof argArray[0] === 'string') {
          if (URL.canParse(argArray[0])) {
            argArray[0] = new URL(argArray[0])
          } else if (URL.canParse(argArray[0], location.origin)) {
            argArray[0] = new URL(argArray[0], location.origin)
          } else {
            return Reflect.apply(...args)
          }
        }

        argArray[1] ??= {}
        argArray[1].method ??= 'GET'

        const [url, init] = argArray

        let response: Response | null = null

        switch (init.method) {
          case 'GET':
            // 動画情報API
            if (
              /^\/watch\/[a-z]{2}?\d+$/.test(url.pathname) &&
              url.searchParams.get('responseType') === 'json'
            ) {
              response = await hookWatch(args)
            }

            break

          case 'POST':
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

            break
        }

        return response ?? Reflect.apply(...args)
      },
    })
  },
})
