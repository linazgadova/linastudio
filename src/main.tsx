import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Шрифты лежат в сборке, а не тянутся с чужого CDN:
// страница не зависит от доступности Google и не течёт данными.
import '@fontsource-variable/geologica'
import '@fontsource-variable/onest'
import '@fontsource-variable/jetbrains-mono'

import App from './App'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('Не найден #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
