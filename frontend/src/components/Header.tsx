import { msalInstance } from '../auth/msal'

export default function Header() {
  const user = msalInstance.getActiveAccount()
  return (
    <header style={{ padding: 16, textAlign: 'right' }}>
      <span>{user?.username ?? 'Signed out'}</span>
    </header>
  )
}

