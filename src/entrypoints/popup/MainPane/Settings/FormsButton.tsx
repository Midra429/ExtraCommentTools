import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/getFormsUrl'

import { IconLink } from '@/components/IconLink'
import { extractVideoId } from '@/utils/api/extractVideoId'

export function FormsButton() {
  async function onPress() {
    const tab = await webext.getCurrentActiveTab()

    const url = await getFormsUrl({
      url: extractVideoId(tab?.url ?? '') && tab?.url,
    })

    webext.tabs.create({ url })
  }

  return (
    <IconLink
      icon={ClipboardPenIcon}
      title="不具合報告・機能提案"
      onPress={onPress}
    />
  )
}
