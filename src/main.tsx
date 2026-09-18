import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { MotionProvider } from './components/Motion'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
)
