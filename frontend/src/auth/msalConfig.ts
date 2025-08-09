export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri:
      typeof window === 'undefined'
        ? undefined
        : import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri:
      typeof window === 'undefined'
        ? undefined
        : import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: true },
  system: { allowRedirectInIframe: false, iframeHashTimeout: 7000 }
}
