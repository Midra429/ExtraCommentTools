import type { ExtSlot } from '@/core/slots'

import { Button, cn } from '@nextui-org/react'
import { Trash2Icon } from 'lucide-react'

export type ButtonsOverlayProps = {
  isManual: ExtSlot['isManual']
  onRemove: () => void
}

export const ButtonsOverlay: React.FC<ButtonsOverlayProps> = ({
  isManual,
  onRemove,
}) => {
  return (
    <div
      className={cn(
        'absolute inset-[1px] z-10',
        'opacity-0 hover:opacity-100',
        'transition-opacity'
      )}
    >
      {/* 削除 */}
      {isManual && (
        <Button
          className={cn(
            'absolute right-[2px] top-[2px]',
            '!size-6 min-h-0 min-w-0',
            'border-1 border-white/80'
          )}
          size="sm"
          radius="full"
          variant="solid"
          color="danger"
          isIconOnly
          startContent={<Trash2Icon className="size-3.5" />}
          onPress={onRemove}
        />
      )}
    </div>
  )
}
