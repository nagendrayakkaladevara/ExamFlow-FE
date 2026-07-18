import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/lib/env'
import '@/index.css'
import { App } from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
