import React, { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ReceiptContext } from "../context/ReceiptContext.jsx"

export default function ReviewPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext)
  const [mapping, setMapping] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch field mapping from backend so the form knows which fields to display.
    async function loadMapping() {
      try {
        const res = await axios.get("http://localhost:5000/api/fields")
        setMapping(res.data)
      } catch (e) {
        console.error("Failed to load field mapping", e)
      }
    }
    loadMapping()
  }, [])

  const handleChange = (key, value) => {
    setReceipt((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value,
      },
    }))
  }

  const handleNext = () => {
    navigate("/signature")
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Review Extracted Data</h1>
      <form>
        {mapping.map((field) => (
          <div key={field.stateKey} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required ? " *" : ""}
            </label>
            <input
              type="text"
              value={receipt.fields[field.stateKey] || ""}
              onChange={(e) => handleChange(field.stateKey, e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        ))}
      </form>
      <button
        type="button"
        onClick={handleNext}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Continue to Signature
      </button>
    </div>
  )
}
