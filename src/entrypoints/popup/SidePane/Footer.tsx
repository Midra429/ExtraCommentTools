import { Button, cn } from '@heroui/react'
import { RotateCwIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

export const Footer: React.FC = () => {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between gap-1',
        'p-2',
        'border-t-1 border-foreground-200',
        'bg-content1'
      )}
    >
      <span className="text-tiny">
        変更を適用するにはページを再読み込みしてください
      </span>

      <Button
        className="shrink-0"
        size="sm"
        variant="solid"
        color="primary"
        startContent={<RotateCwIcon className="size-4" />}
        onPress={() => webext.tabs.reload()}
      >
        再読み込み
      </Button>
    </div>
  )
}
