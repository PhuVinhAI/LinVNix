import React from 'react'
import ReactDOM from 'react-dom/client'
import { isElectron } from '@/lib/platform'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app'

// Conditional imports cho Electron-specific features
const renderApp = async () => {
  if (isElectron()) {
    // Electron mode: với custom window
    const icon = await import('@/resources/build/icon.png?asset').then(m => m.default)
    const { WindowContextProvider, menuItems } = await import('@/app/components/window')
    
    ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <WindowContextProvider titlebar={{ title: 'LinVNix Admin', icon, menuItems }}>
            <App />
          </WindowContextProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )
  } else {
    // Web mode: không có custom window
    ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )
  }
}

renderApp()
