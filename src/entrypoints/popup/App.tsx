import { slotsManager } from '@/hooks/useExtSlots'

import { Layout } from '@/components/Layout'

import { MainPane } from './MainPane'
import { SidePane } from './SidePane'

const App: React.FC = () => {
  const isActive = !!slotsManager
  const height = isActive ? 500 : 450

  return (
    <Layout className="overflow-hidden">
      <div className="flex size-fit flex-row">
        {isActive && (
          <div
            className="border-r-1 border-foreground-200"
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
