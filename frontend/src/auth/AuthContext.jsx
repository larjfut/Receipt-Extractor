import React, { createContext, useState, useEffect } from 'react'
import { msalApp, ensureSignedIn, onAuthSuccess } from './msal'

export const AuthContext = createContext({ user: null })

export function AuthProvider({ children }) {
  const demo = import.meta.env.VITE_DEMO_MODE === 'true'
  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'msal'
  const api = import.meta.env.VITE_API_BASE_URL || '/api'
  const [user, setUser] = useState(
    demo ? { id: 'demo', name: 'Demo User', email: 'demo@example.com' } : null,
  )

  useEffect(() => {
    if (demo) return
    async function load() {
      if (provider === 'local') {
        const res = await fetch(`${api}/auth/me`, { credentials: 'include' })
        if (res.ok) setUser(await res.json())
      } else if (provider === 'msal') {
        const r = await ensureSignedIn()
        if (r.status !== 'redirecting') {
          onAuthSuccess()
          const account = msalApp.getActiveAccount()
          if (account)
            setUser({
              id: account.homeAccountId || null,
              name: account.name || null,
              email: account.username || null,
            })
        }
      }
    }
    load()
  }, [demo, provider])

  const login = async (email, password) => {
    if (demo) return
    if (provider === 'local') {
      await fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const res = await fetch(`${api}/auth/me`, { credentials: 'include' })
      if (res.ok) setUser(await res.json())
    } else if (provider === 'msal') {
      msalApp.loginRedirect({ scopes: ['openid', 'profile', 'email'] })
    }
  }

  const logout = async () => {
    if (demo) return
    if (provider === 'local') {
      await fetch(`${api}/auth/logout`, { method: 'POST', credentials: 'include' })
    } else if (provider === 'msal') {
      msalApp.logout()
    }
    setUser(demo ? user : null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
