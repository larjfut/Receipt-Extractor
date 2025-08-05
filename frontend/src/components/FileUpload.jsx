import React, { useRef } from 'react'
import { checkImageQuality } from '../utils/imageQuality'

/**
 * A basic file upload component.  When the user selects a file, the
 * `onFileSelected` callback is invoked with the first file in the input.
 */
export default function FileUpload({ onFileSelected }) {
  const cameraInputRef = useRef(null)

  const processFile = (file) => {
    const img = new Image()
    img.onload = async () => {
      const quality = await checkImageQuality(img)
      onFileSelected(file, quality)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleCameraChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  return (
    <div className="p-6 border-dashed border-2 border-gray-300 rounded-lg bg-white">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="block w-full text-sm text-gray-700 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
      <p className="mt-2 text-gray-500">
        Choose an image or PDF of your receipt.
      </p>
      <ul className="mt-2 text-gray-500 text-sm list-disc list-inside">
        <li>Show all four receipt edges.</li>
        <li>Use sharp focus and good lighting.</li>
        <li>Ensure text is clear for OCR.</li>
      </ul>
    </div>
  )
}
