import React, { createContext, useEffect, useState } from 'react'

export const UserContext = createContext({ displayName: null })

export function UserProvider({ children }) {
  const [displayName, setDisplayName] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { PublicClientApplication } = await import('@azure/msal-browser')
        const pca = new PublicClientApplication({
          auth: {
            clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`
          }
        })
        await pca.initialize()
        const account = await pca
          .ssoSilent({ scopes: ['User.Read'] })
          .then(r => r.account)
        const token = await pca.acquireTokenSilent({
          scopes: ['User.Read'],
          account
        })
        if (active) setDisplayName(token.account?.name || null)
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <UserContext.Provider value={{ displayName }}>
      {children}
    </UserContext.Provider>
  )
}
