import React from 'react'
import { UserContext } from '../context/UserContext.jsx'

export default function UserHeader() {
  const { displayName } = React.useContext(UserContext)
  if (!displayName) return null
  return (
    <div className='p-4 bg-gray-800 text-white text-right'>
      {displayName}
    </div>
  )
}
