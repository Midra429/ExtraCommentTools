import { cn } from '@heroui/react'

export function Header() {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between',
        'p-2',
        'border-foreground-200 border-b-1',
        'bg-content1',
        'font-semibold text-medium'
      )}
    >
      <div className="flex min-h-8 flex-row items-center">
        <span>引用中のコメント</span>
      </div>
    </div>
  )
}
