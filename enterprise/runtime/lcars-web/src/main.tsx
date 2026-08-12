/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LcarsLab } from './lab/LcarsLab.tsx'

function Root() {
  const isLab = window.location.hash.startsWith('#/lab')
  return isLab ? <LcarsLab /> : <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

window.addEventListener('hashchange', () => window.location.reload())
