import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback(level, message, containsPii) {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            break
          case LogLevel.Info:
            console.info(message)
            break
          case LogLevel.Verbose:
            console.debug(message)
            break
          case LogLevel.Warning:
            console.warn(message)
            break
        }
      },
      logLevel: LogLevel.Info
    }
  }
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: [
    'api://261b67cf-259a-438f-a6ab-caef704948d2/access_as_user',
    'User.Read'
  ]
}

