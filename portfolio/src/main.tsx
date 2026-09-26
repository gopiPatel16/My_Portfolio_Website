import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// A refresh opens on the home screen, not wherever the reader had scrolled to.
// Browsers restore the old position by default, and they do it late enough to
// land after Lenis has started, so it has to be switched off before anything
// renders. A link that names a section (`/#research`) still goes there —
// HashTarget in App handles that once the page exists.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!location.hash) window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
