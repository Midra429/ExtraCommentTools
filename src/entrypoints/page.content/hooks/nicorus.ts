import type { FetchProxyApplyArguments } from '..'

import { logger } from '@/utils/logger'

import { hooksSharedData } from '.'

type ThreadsNicorusRequestBody = {
  videoId: string
  fork: string
  no: number
  content: string
  nicoruKey: string
}

export const hookNicorus = async (
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> => {
  const { videoId, videoData, slotsManager } = hooksSharedData

  if (!videoId || !videoData || !slotsManager) {
    return null
  }

  logger.log('hookNicorus()')

  const [url, init] = args[2]
  const apiLogName = `${init.method} ${url.pathname}`

  const body: ThreadsNicorusRequestBody | null =
    typeof init?.body === 'string' && /^{.*}$/.test(init.body)
      ? JSON.parse(init.body)
      : null

  if (!body) {
    return null
  }

  return null
}
