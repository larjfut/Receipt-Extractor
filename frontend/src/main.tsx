import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ReceiptProvider } from './context/ReceiptContext.jsx'
import { signIn } from './auth'

signIn()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReceiptProvider>
        <App />
      </ReceiptProvider>
    </BrowserRouter>
  </React.StrictMode>
)

