import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser'
import { msalConfig } from './msalConfig'

export const msalApp = new PublicClientApplication(msalConfig)

export async function ensureSignedIn(scopes = ['openid', 'profile', 'email']) {
  await msalApp.initialize()
  let account = msalApp.getActiveAccount() ?? msalApp.getAllAccounts()[0]
  if (account) msalApp.setActiveAccount(account)

  try {
    if (account) {
      await msalApp.acquireTokenSilent({ account, scopes })
      return { status: 'silent-ok', account: msalApp.getActiveAccount() }
    }
    await msalApp.ssoSilent({
      loginHint: localStorage.getItem('lastLoginHint') || undefined,
      domainHint: 'organizations',
      scopes
    })
    account = msalApp.getAllAccounts()[0]
    if (account) {
      msalApp.setActiveAccount(account)
      return { status: 'sso-ok', account }
    }
  } catch (e) {
  }

  try {
    await msalApp.loginRedirect({
      prompt: 'select_account',
      domainHint: 'organizations',
      scopes
    })
    return { status: 'redirecting' }
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      await msalApp.loginRedirect({ prompt: 'select_account', domainHint: 'organizations', scopes })
    }
    throw e
  }
}

export function onAuthSuccess() {
  const acct = msalApp.getActiveAccount()
  if (acct?.username) localStorage.setItem('lastLoginHint', acct.username)
}
