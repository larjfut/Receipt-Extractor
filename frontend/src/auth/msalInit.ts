import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig, loginRequest } from "./msalConfig"

export const pca = new PublicClientApplication(msalConfig)

export async function msalInit() {
  await pca.handleRedirectPromise().catch(() => {})
  const accts = pca.getAllAccounts()
  if (accts.length) pca.setActiveAccount(accts[0])
}

export async function ensureSignedIn() {
  const account = pca.getActiveAccount() || pca.getAllAccounts()[0]
  if (!account) {
    await pca.loginRedirect({ ...loginRequest, prompt: "select_account" })
  }
}

export async function acquireApiToken() {
  const account = pca.getActiveAccount()
  if (!account) throw new Error("No active account")
  try {
    const res = await pca.acquireTokenSilent({ ...loginRequest, account })
    return res.accessToken
  } catch {
    await pca.acquireTokenRedirect(loginRequest)
    return ""
  }
}
