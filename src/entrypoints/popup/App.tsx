import { useSlotsManager } from '@/hooks/useSlots'

import { Layout } from '@/components/Layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

function App() {
  const slotsManager = useSlotsManager()

  const isActive = !!slotsManager
  const height = isActive ? 500 : 450

  return (
    <Layout className="overflow-hidden">
      <div className="flex size-fit flex-row">
        {isActive && (
          <div
            className="border-foreground-200 border-r-1"
            style={{
              width: 430,
              height,
            }}
          >
            <SidePane />
          </div>
        )}

        <div
          style={{
            width: 370,
            height,
          }}
        >
          <MainPane isActive={isActive} />
        </div>
      </div>
    </Layout>
  )
}

export default App
