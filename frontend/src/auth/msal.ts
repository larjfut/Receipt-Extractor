import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

const tenant = import.meta.env.VITE_MSAL_TENANT_ID
const clientId = import.meta.env.VITE_MSAL_CLIENT_ID
const redirectUri =
  import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin

if (!tenant) console.error('VITE_MSAL_TENANT_ID is missing')
if (!clientId) console.error('VITE_MSAL_CLIENT_ID is missing')

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenant || 'organizations'}`,
    redirectUri,
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
  system: { loggerOptions: { logLevel: LogLevel.Warning } },
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: [
    'api://261b67cf-259a-438f-a6ab-caef704948d2/access_as_user',
    'User.Read',
  ],
}

// Expose minimal debug helpers in preview builds
;(window as any).debugAuth = {
  cfg: msalConfig,
  accounts: () => msalInstance.getAllAccounts(),
}
