import type { Slot } from '@/core/slots'

import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Settings2Icon, XIcon } from 'lucide-react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useWillChange,
} from 'framer-motion'

import { TRANSITION_VARIANTS_ACCORDION } from '@/constants/framer-motion'
import { useSlotsManager } from '@/hooks/useSlots'

import { OffsetControl } from '@/components/OffsetControl'

export interface OptionsButtonProps {
  isOpen: boolean
  onPress: () => void
}

export function OptionsButton({ isOpen, onPress }: OptionsButtonProps) {
  return (
    <Button
      className="size-6! min-h-0 min-w-0"
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      onPress={onPress}
    >
      {isOpen ? (
        <XIcon className="size-3.5" />
      ) : (
        <Settings2Icon className="size-3.5" />
      )}
    </Button>
  )
}

interface SlotOffsetControlProps {
  id: Slot['id']
  isStock: Slot['isStock']
  isAuto: Slot['isAuto']
  offsetMs: Slot['offsetMs']
}

function SlotOffsetControl({
  id,
  isStock,
  isAuto,
  offsetMs,
}: SlotOffsetControlProps) {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  const slotsManager = useSlotsManager()

  useEffect(() => {
    const ofs = Math.round((offsetMs ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [offsetMs])

  async function onApply() {
    await slotsManager?.update({
      id,
      offsetMs: offset * 1000,
      isManual: offset ? true : !(isStock || isAuto),
    })
  }

  return (
    <OffsetControl
      compact
      value={offset}
      isValueChanged={offset !== currentOffset}
      onValueChange={setOffset}
      onApply={onApply}
    />
  )
}

export interface OptionsProps extends SlotOffsetControlProps {
  isOpen: boolean
}

export function Options({
  isOpen,
  id,
  isStock,
  isAuto,
  offsetMs,
}: OptionsProps) {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="slot-options"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={TRANSITION_VARIANTS_ACCORDION}
          >
            <div className="border-foreground-200 border-t-1 p-2">
              <SlotOffsetControl
                id={id}
                isStock={isStock}
                isAuto={isAuto}
                offsetMs={offsetMs}
              />
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
