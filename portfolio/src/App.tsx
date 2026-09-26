import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { BackToTop, Backdrop, Cursor, Nav, ScrollProgress } from './components/Chrome'
import { PdfPreviewProvider } from './components/PdfPreview'
import { Footer } from './components/sections/Contact'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import { useSmoothScroll } from './hooks'

/** Honours a `/#section` hash arriving from another route. */
function HashTarget() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (pathname !== '/' || !hash) return
    const el = document.querySelector(hash)
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
  }, [pathname, hash])
  return null
}

export default function App() {
  useSmoothScroll()

  return (
    <PdfPreviewProvider>
      <Backdrop />
      <ScrollProgress />
      <Cursor />
      <BackToTop />
      <Nav />
      <HashTarget />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </PdfPreviewProvider>
  )
}
