import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ReceiptProvider } from './context/ReceiptContext.jsx'
import { signIn, getToken, callApi } from './auth'

// Kick off MSAL once on startup
signIn()

// Expose helpers only in preview/dev to simplify testing
if (import.meta.env.MODE !== 'production') {
  ;(window as any).debugApi = { getToken, callApi }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReceiptProvider>
        <App />
      </ReceiptProvider>
    </BrowserRouter>
  </React.StrictMode>
)
