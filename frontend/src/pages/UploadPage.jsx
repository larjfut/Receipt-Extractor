import React, { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ReceiptContext } from "../context/ReceiptContext.jsx"
import FileUpload from "../components/FileUpload.jsx"

export default function UploadPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = async (file) => {
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      // Call backend OCR endpoint
      const resp = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      // Update state with extracted fields and the uploaded file
      setReceipt({
        ...receipt,
        fields: resp.data.data || {},
        attachments: [file],
      })
      navigate("/review")
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      <FileUpload onFileSelected={handleFileUpload} />
      {loading && <p className="mt-2 text-blue-600">Extracting data…</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  )
}
