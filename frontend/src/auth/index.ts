import { msalInstance, loginRequest } from './msal'

export async function signIn() {
  await msalInstance.handleRedirectPromise()
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length === 0) {
    msalInstance.loginRedirect(loginRequest)
  } else {
    msalInstance.setActiveAccount(accounts[0])
  }
}

export async function getToken() {
  const account = msalInstance.getActiveAccount()
  if (!account) {
    await msalInstance.acquireTokenRedirect(loginRequest)
    return ''
  }
  try {
    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    })
    return result.accessToken
  } catch (e) {
    await msalInstance.acquireTokenRedirect(loginRequest)
    return ''
  }
}

export async function callApi(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  })
  if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`)
  return resp.json()
}

