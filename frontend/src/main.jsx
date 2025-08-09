import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"
import { ReceiptProvider } from "./context/ReceiptContext.jsx"
import { AuthProvider } from "./auth/AuthContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReceiptProvider>
          <App />
        </ReceiptProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
