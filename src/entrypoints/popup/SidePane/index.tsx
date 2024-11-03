import { memo } from 'react'

import { Header } from './Header'
import { Body } from './Body'
import { Footer } from './Footer'

/**
 * サイド
 */
export const SidePane: React.FC = memo(() => {
  return (
    <div className="flex h-full flex-col">
      <Header />

      <Body />

      <Footer />
    </div>
  )
})
