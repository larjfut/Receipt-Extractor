import React, { createContext, useState, useEffect } from "react"

// Context for storing the current requisition state.  Fields map to the stateKey
// values defined in backend/fieldMapping.json.  Attachments is an array of
// File objects, and signature is a base64 data URL.

export const ReceiptContext = createContext(null)

const initialReceipt = {
  fields: {},
  attachments: [],
  signature: null,
  contentTypeId: null,
  contentTypeName: "",
}

export function ReceiptProvider({ children }) {
  const [receipt, setReceipt] = useState(initialReceipt)

  const [contentTypes, setContentTypes] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("contentTypes")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return []
        }
      }
    }
    return []
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("contentTypes", JSON.stringify(contentTypes))
    }
  }, [contentTypes])

  const resetReceipt = () => setReceipt(initialReceipt)

  return (
    <ReceiptContext.Provider
      value={{
        receipt,
        setReceipt,
        contentTypes,
        setContentTypes,
        resetReceipt,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  )
}
