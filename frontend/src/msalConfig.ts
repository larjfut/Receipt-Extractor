export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  },
  system: {
    allowRedirectInIframe: false,
    iframeHashTimeout: 7000
  }
}

export async function getToken(instance, account, request) {
  try {
    return await instance.acquireTokenSilent({ ...request, account })
  } catch (e) {
    return instance.acquireTokenRedirect(request)
  }
}
