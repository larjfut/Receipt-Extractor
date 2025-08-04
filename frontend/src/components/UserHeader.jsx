import React from 'react'
import { UserContext } from '../context/UserContext.jsx'

export default function UserHeader() {
  const { user, setUser } = React.useContext(UserContext)
  const [users, setUsers] = React.useState([])

  React.useEffect(() => {
    if (!user) {
      fetch('/api/users')
        .then(r => r.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err))
    }
  }, [user])

  if (!user)
    return (
      <div className='p-4 bg-gray-800 text-white text-right'>
        <select
          className='text-black'
          onChange={e => {
            const u = users.find(x => x.id === e.target.value)
            setUser(u || null)
          }}
        >
          <option value=''>Select user</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>
      </div>
    )

  return (
    <div className='p-4 bg-gray-800 text-white text-right'>
      {user.displayName}
    </div>
  )
}
