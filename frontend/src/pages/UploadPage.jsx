import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ReceiptContext } from '../context/ReceiptContext.jsx'
import FileUpload from '../components/FileUpload.jsx'
import { QUALITY_MESSAGES } from '../utils/qualityMessages'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default function UploadPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputKey, setInputKey] = useState(0)
  const [readyAttachments, setReadyAttachments] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  useEffect(() => {
    const urls = readyAttachments.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [readyAttachments])

  const handleFileUpload = async (files) => {
    setError(null)
    let qualityMessage = null
    for (const { file, quality } of files) {
      if (quality?.error) qualityMessage = quality.error
      else if (!quality?.hasFourEdges) qualityMessage = QUALITY_MESSAGES.edges
      else if (quality.blurVariance < 100)
        qualityMessage = QUALITY_MESSAGES.blur
      else if (quality.ocrConfidence < 60) qualityMessage = QUALITY_MESSAGES.ocr
      if (qualityMessage) break
    }

    if (qualityMessage) {
      setError({ type: 'quality', message: qualityMessage })
      return
    }

    setReadyAttachments((prev) => [...prev, ...files.map((f) => f.file)])
  }

  const uploadReadyAttachments = async () => {
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      readyAttachments.forEach((file) => formData.append('files', file))
      const resp = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const rawFields = Array.isArray(resp.data)
        ? resp.data.reduce((acc, cur) => ({ ...acc, ...(cur.data || {}) }), {})
        : resp.data.data || {}
      const normalizeKeys = (obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k.replace('[i]', '[0]'), v])
        )
      const fields = normalizeKeys(rawFields)
      setReceipt({
        ...receipt,
        fields,
        attachments: [...(receipt.attachments || []), ...readyAttachments],
      })
      setReadyAttachments([])
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
      {readyAttachments.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            Attachments Ready for Submit
          </h2>
          <div className="flex flex-wrap gap-4">
            {readyAttachments.map((file, idx) => (
              <img
                key={idx}
                src={previewUrls[idx]}
                alt={`ready-${idx}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={uploadReadyAttachments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit Attachments
          </button>
        </div>
      )}
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
