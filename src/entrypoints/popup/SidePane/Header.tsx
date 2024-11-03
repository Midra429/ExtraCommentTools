import { cn } from '@nextui-org/react'

export const Header: React.FC = () => {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between',
        'p-2',
        'border-b-1 border-foreground-200',
        'bg-content1',
        'text-medium font-semibold'
      )}
    >
      <div className="flex min-h-8 flex-row items-center">
        <span>引用中のコメント</span>
      </div>
    </div>
  )
}
