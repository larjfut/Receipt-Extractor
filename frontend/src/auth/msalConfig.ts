const required = [
  'VITE_MSAL_CLIENT_ID',
  'VITE_MSAL_TENANT_ID',
  'VITE_MSAL_REDIRECT_URI'
];
const missing = required.filter(k => !import.meta.env[k]);
if (missing.length) {
  throw new Error(`MSAL config missing: ${missing.join(', ')}`);
}

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

// If you created a separate API app registration, set VITE_API_CLIENT_ID in Vercel.
// If not, we'll fall back to the SPA client ID.
const API_CLIENT_ID =
  import.meta.env.VITE_API_CLIENT_ID || import.meta.env.VITE_MSAL_CLIENT_ID;

// Scope your SPA requests so AAD issues an access token for your API
export const loginRequest = {
  scopes: [`api://${API_CLIENT_ID}/access_as_user`]
};

