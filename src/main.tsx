import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './LandingPage.tsx'
import UpdatesPage from './UpdatesPage.tsx'

const Page = window.location.pathname.replace(/\/+$/, '') === '/updates' ? UpdatesPage : LandingPage
if (Page === UpdatesPage) document.title = '项目更新 · 星潮 Xingchao'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
