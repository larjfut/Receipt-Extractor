require('dotenv').config()

const debug = process.env.DEBUG_ENV === 'true'

console.log('Testing environment variables...')

const logVar = (label, value, { alwaysHidden } = {}) => {
  if (debug && !alwaysHidden) {
    console.log(`${label}:`, value)
  } else {
    console.log(`${label} loaded:`, value ? 'Yes ✅' : 'No ❌')
  }
}

logVar('Tenant ID', process.env.TENANT_ID)
logVar('Client ID', process.env.CLIENT_ID)
logVar('Site ID', process.env.SITE_ID)
logVar('List ID', process.env.LIST_ID)
logVar('Client Secret', process.env.CLIENT_SECRET, { alwaysHidden: true })
