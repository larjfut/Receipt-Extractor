import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ReceiptContext } from '../context/ReceiptContext.jsx'
import FileUpload from '../components/FileUpload.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const QUALITY_MESSAGES = {
  edges:
    'Receipt edges not detected. Ensure entire receipt is visible and retry.',
  blur: 'Image too blurry for OCR. Retake with better focus.',
  ocr: 'Text too blurry for OCR. Retake in better lighting.',
}

export default function UploadPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputKey, setInputKey] = useState(0)

  const handleFileUpload = async (file, quality) => {
    setError(null)
    let qualityMessage = null
    if (quality?.error) qualityMessage = quality.error
    else if (!quality?.hasFourEdges) qualityMessage = QUALITY_MESSAGES.edges
    else if (quality.blurVariance < 100) qualityMessage = QUALITY_MESSAGES.blur
    else if (quality.ocrConfidence < 60) qualityMessage = QUALITY_MESSAGES.ocr

    if (qualityMessage) {
      setError({ type: 'quality', message: qualityMessage })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const resp = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setReceipt({
        ...receipt,
        fields: resp.data.data || {},
        attachments: [file],
      })
      navigate('/review')
    } catch (err) {
      console.error(err)
      setError({
        type: 'backend',
        message: err.response?.data?.error || err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setError(null)
    setInputKey((k) => k + 1)
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      <FileUpload key={inputKey} onFileSelected={handleFileUpload} />
      {loading && <p className="mt-2 text-blue-600">Extracting data…</p>}
      {error && (
        <div className="mt-2">
          <p className="text-red-600">{error.message}</p>
          {error.type === 'quality' && (
            <button
              type="button"
              onClick={handleRetake}
              className="mt-2 px-4 py-2 bg-gray-200 rounded"
            >
              Retake
            </button>
          )}
        </div>
      )}
    </div>
  )
}
