import { Button } from '@heroui/react'

import { webext } from '@/utils/webext'

import { Tooltip } from '@/components/Tooltip'

export type IconLinkProps = {
  icon: React.FC<any>
  title?: string
} & (
  | {
      href: string
    }
  | {
      onPress: () => void
    }
)

export function IconLink(props: IconLinkProps) {
  return (
    <Tooltip
      content={
        props.title ||
        ('href' in props && new URL(props.href).pathname.slice(1))
      }
    >
      <Button
        size="sm"
        radius="full"
        variant="light"
        isIconOnly
        onPress={
          'onPress' in props
            ? props.onPress
            : () => webext.tabs.create({ url: props.href })
        }
      >
        <props.icon className="size-5 text-foreground-700" />
      </Button>
    </Tooltip>
  )
}
