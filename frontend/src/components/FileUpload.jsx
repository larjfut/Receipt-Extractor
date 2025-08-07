import React, { useRef, useState, useEffect } from 'react'
import { checkImageQuality } from '../utils/imageQuality'
import { QUALITY_MESSAGES } from '../utils/qualityMessages'
import InfoIcon from './InfoIcon.jsx'

/**
 * Drag-and-drop file upload component. The `onFileSelected` callback receives
 * an array of objects containing `{ file, quality }` for each selected file.
 */
export default function FileUpload({ onFileSelected }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [previews, setPreviews] = useState([])

  const processFile = (file) =>
    new Promise((resolve) => {
      if (file.type === 'application/pdf') {
        resolve({ file, quality: null })
        return
      }
      const img = new Image()
      img.onload = async () => {
        const quality = await checkImageQuality(img)
        URL.revokeObjectURL(img.src)
        resolve({ file, quality })
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        resolve({ file, quality: { error: 'Failed to load image' } })
      }
      img.src = URL.createObjectURL(file)
    })

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const startIndex = previews.length
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      status: 'checking',
      reason: '',
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
    const results = await Promise.all(files.map(processFile))
    const updates = results.map(({ quality }) => {
      let status = 'ready'
      let reason = ''
      if (quality) {
        if (quality.error) {
          status = 'unreadable'
          reason = quality.error
        } else if (!quality.hasFourEdges) {
          status = 'unreadable'
          reason = QUALITY_MESSAGES.edges
        } else if (quality.blurVariance < 100) {
          status = 'unreadable'
          reason = QUALITY_MESSAGES.blur
        } else if (quality.ocrConfidence < 60) {
          status = 'unreadable'
          reason = QUALITY_MESSAGES.ocr
        }
      }
      return { status, reason }
    })
    setPreviews((prev) => {
      const updated = [...prev]
      updates.forEach((u, i) => {
        updated[startIndex + i] = { ...updated[startIndex + i], ...u }
      })
      return updated
    })
    onFileSelected(results)
  }

  const handleChange = (e) => handleFiles(e.target.files)

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleCameraChange = (e) => handleFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => e.preventDefault()

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  useEffect(
    () => () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    },
    [previews]
  )

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFilePicker}
        className="p-6 border-dashed border-2 border-gray-300 rounded-lg bg-white text-center cursor-pointer"
      >
        <p className="text-gray-500">Drag and drop files here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <div key={i} className="flex flex-col items-center">
              {p.type === 'application/pdf' ? (
                <PdfPreview url={p.url} />
              ) : (
                <img
                  src={p.url}
                  alt={`preview-${i}`}
                  className="w-20 h-20 object-cover border"
                />
              )}
              <div className="text-xs mt-1 text-gray-600 flex items-center gap-1">
                {p.status === 'checking' && 'Checking...'}
                {p.status === 'ready' && 'Ready'}
                {p.status === 'unreadable' && (
                  <>
                    Unreadable <InfoIcon message={p.reason} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCameraChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleCameraClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Take Photo
      </button>
      <p className="mt-2 text-gray-500">Choose an image or PDF of your receipt.</p>
      <ul className="mt-2 text-gray-500 text-sm list-disc list-inside">
        <li>Show all four receipt edges.</li>
        <li>Use sharp focus and good lighting.</li>
        <li>Ensure text is clear for OCR.</li>
      </ul>
    </div>
  )
}

function PdfPreview({ url }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    import('pdfjs-dist/build/pdf').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString()
      pdfjs
        .getDocument(url)
        .promise.then((pdf) => pdf.getPage(1))
        .then((page) => {
          const viewport = page.getViewport({ scale: 0.2 })
          const canvas = canvasRef.current
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width
          page.render({ canvasContext: context, viewport })
        })
    })
  }, [url])

  return <canvas ref={canvasRef} className="w-20 h-20 border" />
}

