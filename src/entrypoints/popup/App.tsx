import { useSlotsManager } from '@/hooks/useSlots'

import { Layout } from '@/components/Layout'

import { Comments } from './Comments'
import { MainTabs } from './MainTabs'
import { Settings } from './MainTabs/Settings'

function App() {
  const slotsManager = useSlotsManager()

  const isActive = !!slotsManager

  return (
    <Layout className="overflow-hidden">
      <div
        className="flex w-fit flex-row *:h-full"
        style={{
          height: isActive ? 500 : 450,
        }}
      >
        {isActive && (
          <div className="flex w-107 flex-col border-foreground-200 border-r-1">
            <Comments />
          </div>
        )}

        <div className="flex w-93 flex-col">
          {isActive ? (
            <MainTabs />
          ) : (
            <div className="h-full overflow-y-auto">
              <Settings />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default App
