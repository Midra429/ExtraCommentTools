export const NICONICO_HOST_REGEXP = /^(?:(?:www|sp)\.)?nicovideo\.jp$/
export const NICONICO_HOST_SHORT_REGEXP = /^\.?nico\.ms$/
export const NICONICO_WATCH_PATH_REGEXP = /(?<=^\/watch\/)(?:[a-z]{2})?\d+$/
export const NICONICO_WATCH_PATH_SHORT_REGEXP = /^\/(?:[a-z]{2})?\d+$/
export const NICONICO_VIDEO_ID_REGEXP = /^(?:[a-z]{2})?\d+$/

export function isVideoId(value: string) {
  return NICONICO_VIDEO_ID_REGEXP.test(value)
}

export function extractVideoId(value: string): string | null {
  if (isVideoId(value)) {
    return value
  }

  try {
    const { hostname, pathname } = new URL(value)

    if (
      // https://www.nicovideo.jp/watch/so30406298
      // https://sp.nicovideo.jp/watch/so32994420
      (NICONICO_HOST_REGEXP.test(hostname) &&
        NICONICO_WATCH_PATH_REGEXP.test(pathname)) ||
      // https://nico.ms/so34006022
      (NICONICO_HOST_SHORT_REGEXP.test(hostname) &&
        NICONICO_WATCH_PATH_SHORT_REGEXP.test(pathname))
    ) {
      return pathname.split('/').at(-1)!
    }
  } catch {}

  return null
}
