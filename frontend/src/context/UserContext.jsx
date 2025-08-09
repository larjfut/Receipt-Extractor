import React, { createContext, useEffect, useState } from 'react'
import { msalConfig, getToken } from '../msalConfig'

export const UserContext = createContext({ user: null, setUser: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { PublicClientApplication } = await import('@azure/msal-browser')
        const pca = new PublicClientApplication(msalConfig)
        await pca.initialize()
        const account = await pca
          .ssoSilent({ scopes: ['User.Read'] })
          .then(r => r.account)
        const token = await getToken(pca, account, { scopes: ['User.Read'] })
        if (active)
          setUser({
            id: account?.homeAccountId || null,
            displayName: token.account?.name || null
          })
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
