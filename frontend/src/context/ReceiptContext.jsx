import React, { createContext, useState } from "react"

// Context for storing the current requisition state.  Fields map to the stateKey
// values defined in backend/fieldMapping.json.  Attachments is an array of
// File objects, and signature is a base64 data URL.

export const ReceiptContext = createContext(null)

export function ReceiptProvider({ children }) {
  const [receipt, setReceipt] = useState({
    fields: {},
    attachments: [],
    signature: null,
  })

  return (
    <ReceiptContext.Provider value={{ receipt, setReceipt }}>
      {children}
    </ReceiptContext.Provider>
  )
}
