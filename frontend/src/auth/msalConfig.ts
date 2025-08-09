export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_TENANT_ID}`,
    redirectUri: typeof window === 'undefined' ? undefined : window.location.origin,
    postLogoutRedirectUri: typeof window === 'undefined' ? undefined : window.location.origin,
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: true },
  system: { allowRedirectInIframe: false, iframeHashTimeout: 7000 }
}
