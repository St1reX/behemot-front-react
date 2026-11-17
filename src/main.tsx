import '@fontsource-variable/inter'
import '@fontsource-variable/source-serif-4'
import '@fontsource/ibm-plex-mono/100.css'
import '@fontsource/ibm-plex-mono/200.css'
import '@fontsource/ibm-plex-mono/300.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-mono/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './assets/styles/main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
