import type { FetchProxyApplyArguments } from '..'

import { logger } from '@/utils/logger'

import { shared } from '.'

interface ThreadsNicorusRequestBody {
  videoId: string
  fork: string
  no: number
  content: string
  nicoruKey: string
}

export async function hookNicorus(
  args: FetchProxyApplyArguments<true>
): Promise<Response | null> {
  const { videoId, targetVideoData, slotsManager } = shared

  if (!videoId || !targetVideoData || !slotsManager) {
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
