import React, { useRef } from 'react'
import { checkImageQuality } from '../utils/imageQuality'

/**
 * Drag-and-drop file upload component. The `onFileSelected` callback receives
 * an array of objects containing `{ file, quality }` for each selected file.
 */
export default function FileUpload({ onFileSelected }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const processFile = (file) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = async () => {
        const quality = await checkImageQuality(img)
        URL.revokeObjectURL(img.src)
        resolve({ file, quality })
      }
      img.src = URL.createObjectURL(file)
    })

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const results = await Promise.all(files.map(processFile))
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
