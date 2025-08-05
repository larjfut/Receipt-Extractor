import React, { useRef, useState } from 'react'
import { checkImageQuality } from '../utils/imageQuality.js'

/**
 * A basic file upload component.  When the user selects a file, the
 * `onFileSelected` callback is invoked with the first file in the input.
 */
export default function FileUpload({ onFileSelected, onQualityIssues }) {
  const cameraInputRef = useRef(null)
  const [retakeMessage, setRetakeMessage] = useState(false)

  const processFile = async file => {
    const result = await checkImageQuality(file)
    if (result.ok) {
      onQualityIssues?.([])
      onFileSelected(file)
    } else {
      onQualityIssues?.(result.issues)
      setRetakeMessage(true)
      setTimeout(() => setRetakeMessage(false), 2000)
    }
  }

  const handleChange = async e => {
    const file = e.target.files[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleCameraChange = async e => {
    const file = e.target.files[0]
    if (file) {
      await processFile(file)
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
      {retakeMessage && <p className="mt-2 text-red-600">Please retake the photo</p>}
      <p className="mt-2 text-gray-500">Choose an image or PDF of your receipt.</p>
    </div>
  )
}
