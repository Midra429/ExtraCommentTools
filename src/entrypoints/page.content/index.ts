import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { NICONICO_WATCH_PATH_REGEXP } from '@/utils/api/extractVideoId'

import { hookThreads } from './hooks/threads'
import { hookWatch } from './hooks/watch'
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
      apply: async (...args: FetchProxyApplyArguments) => {
        let [input, init] = args[2]

        if (input instanceof Request) {
          return Reflect.apply(...args)
        }

        if (typeof input === 'string') {
          if (URL.canParse(input)) {
            input = new URL(input)
          } else if (URL.canParse(input, location.href)) {
            input = new URL(input, location.href)
          } else {
            return Reflect.apply(...args)
          }
        }

        init ??= {}
        init.method ??= 'GET'

        const hookArgs: FetchProxyApplyArguments<true> = [
          args[0],
          args[1],
          [input, init],
        ]

        let response: Response | null = null

        switch (init.method) {
          case 'GET':
            // 動画情報API
            if (
              NICONICO_WATCH_PATH_REGEXP.test(input.pathname) &&
              input.searchParams.get('responseType') === 'json'
            ) {
              response = await hookWatch(hookArgs)
            }

            break

          case 'POST':
            // コメント取得API
            if (input.pathname === '/v1/threads') {
              response = await hookThreads(hookArgs)
            }

            // ニコるAPI
            // if (
            //   input.pathname.startsWith('/v1/threads') &&
            //   input.pathname.endsWith('/nicorus')
            // ) {
            //   response = await hookNicorus(hookArgs)
            // }

            break
        }

        return response ?? Reflect.apply(...args)
      },
    })
  },
})
