import React from 'react';

/**
 * A basic file upload component.  When the user selects a file, the
 * `onFileSelected` callback is invoked with the first file in the input.
 */
export default function FileUpload({ onFileSelected }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
  };
  return (
    <div className="p-6 border-dashed border-2 border-gray-300 rounded-lg bg-white">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="block w-full text-sm text-gray-700 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
      />
      <p className="mt-2 text-gray-500">Choose an image or PDF of your receipt.</p>
    </div>
  );
}