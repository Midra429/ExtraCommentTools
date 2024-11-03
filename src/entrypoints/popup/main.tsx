import React from 'react'
import ReactDOM from 'react-dom/client'

import { initializeExtSlots } from '@/hooks/useExtSlots'

import App from './App'

initializeExtSlots().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
