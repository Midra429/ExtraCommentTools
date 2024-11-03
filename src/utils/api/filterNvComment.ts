import type { VideoData, NvComment } from '@midra/nco-api/types/niconico/video'

export const filterNvComment = (
  comment: VideoData['comment'],
  exclude?: {
    easy?: boolean
    extra?: boolean
  }
): NvComment => {
  const excludeThreadForkIds = comment.threads
    .filter(({ forkLabel, label }) => {
      return (
        (exclude?.easy && forkLabel === 'easy') ||
        (exclude?.extra && label.startsWith('extra'))
      )
    })
    .map((thread) => {
      return `${thread.forkLabel}:${thread.id.toString()}` as const
    })

  return {
    ...comment.nvComment,
    params: {
      ...comment.nvComment.params,
      targets: comment.nvComment.params.targets.filter((val) => {
        return !excludeThreadForkIds.includes(`${val.fork}:${val.id}`)
      }),
    },
  }
}
