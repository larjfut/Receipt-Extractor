import React from 'react'

export default function InfoIcon({ message }) {
  return (
    <span className="relative group" title={message}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 text-gray-500"
      >
        <path d="M9 7h2v2H9V7zm0 4h2v6H9v-6zm1-9a8 8 0 110 16 8 8 0 010-16z" />
      </svg>
      <span className="absolute z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        {message}
      </span>
    </span>
  )
}
