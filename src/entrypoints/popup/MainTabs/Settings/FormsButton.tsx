import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { extractVideoId } from '@/utils/api/extractVideoId'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { IconLink } from '@/components/IconLink'

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
      Icon={ClipboardPenIcon}
      title="不具合報告・機能提案"
      onPress={onPress}
    />
  )
}
