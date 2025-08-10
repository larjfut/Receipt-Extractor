// frontend/src/auth/msal.ts
import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

const tenant = import.meta.env.VITE_MSAL_TENANT_ID || ''
const clientId = import.meta.env.VITE_MSAL_CLIENT_ID || ''
const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenant || 'organizations'}`,
    redirectUri
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
  system: { loggerOptions: { logLevel: LogLevel.Warning } }
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: [
    'api://261b67cf-259a-438f-a6ab-caef704948d2/access_as_user',
    'User.Read'
  ]
}

// Optional preview debug
;(window as any).debugAuth = {
  env: { tenant, clientId, redirectUri, mode: import.meta.env.MODE },
  cfg: msalConfig,
  accounts: () => msalInstance.getAllAccounts(),
  reset: () => { localStorage.clear(); sessionStorage.clear(); location.reload() }
}
