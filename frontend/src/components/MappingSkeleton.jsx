import React from "react"

export default function MappingSkeleton({ count = 3 }) {
  return (
    <div className="modern-card animate-fade-in">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="mb-5">
          <div className="h-4 bg-white/20 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-10 bg-white/20 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
