import { memo } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { SearchIcon, SettingsIcon } from 'lucide-react'

import { Search } from './Search'
import { Settings } from './Settings'

const tabItems: {
  key: string
  icon: React.FC<React.ComponentProps<'svg'>>
  title: string
  children: React.ReactNode
}[] = [
  {
    key: 'search',
    title: '検索',
    icon: SearchIcon,
    children: <Search />,
  },
  {
    key: 'settings',
    title: '設定',
    icon: SettingsIcon,
    children: <Settings />,
  },
]

/**
 * メイン
 */
export const MainPane: React.FC<{
  isActive?: boolean
}> = memo(({ isActive }) => {
  return (
    <div className="flex size-full flex-col">
      {isActive ? (
        <Tabs
          classNames={{
            base: 'border-b-1 border-foreground-200 bg-content1 p-2',
            tabList: 'bg-content1 p-0',
            cursor: 'rounded-full',
            panel: 'h-full overflow-hidden p-0',
          }}
          color="primary"
          radius="none"
          fullWidth
          destroyInactiveTabPanel={false}
          defaultSelectedKey="settings"
          items={tabItems}
        >
          {({ key, title, icon: Icon, children }) => (
            <Tab
              key={key}
              title={
                <div className="flex flex-row items-center gap-1">
                  <Icon className="size-4" />
                  <span>{title}</span>
                </div>
              }
            >
              <div className="h-full overflow-y-auto">{children}</div>
            </Tab>
          )}
        </Tabs>
      ) : (
        <div className="h-full overflow-y-auto">
          <Settings />
        </div>
      )}
    </div>
  )
})
