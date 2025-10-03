import { Header } from './Header'
import { Body } from './Body'
import { Footer } from './Footer'

/**
 * サイド
 */
export function SidePane() {
  return (
    <div className="flex h-full flex-col">
      <Header />

      <Body />

      <Footer />
    </div>
  )
}
