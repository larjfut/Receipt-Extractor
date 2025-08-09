import React, { createContext, useEffect, useState } from 'react'
import { msalApp, ensureSignedIn, onAuthSuccess } from '../auth/msal'

export const UserContext = createContext({ user: null, setUser: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await ensureSignedIn()
        if (res.status !== 'redirecting' && active) {
          onAuthSuccess()
          const account = msalApp.getActiveAccount()
          if (account && active)
            setUser({
              id: account.homeAccountId || null,
              name: account.name || null,
              email: account.username || null
            })
          if (active) setStatus('ready')
        }
      } catch (err) {
        console.error(err)
        if (active) setStatus('error')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (status === 'loading') return <div>Signing you in...</div>

  if (status === 'error')
    return (
      <button
        onClick={() =>
          msalApp.loginRedirect({
            prompt: 'select_account',
            domainHint: 'organizations',
            scopes: ['openid', 'profile', 'email']
          })
        }
      >
        Sign in
      </button>
    )

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
