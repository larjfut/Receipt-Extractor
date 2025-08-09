const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

let jwks
async function getKey(kid) {
  if (!jwks) {
    const res = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`)
    jwks = await res.json()
  }
  const key = jwks.keys.find(k => k.kid === kid)
  if (!key) throw new Error('JWKS key not found')
  const pem = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`
  return pem
}

async function verify(token) {
  const header = jwt.decode(token, { complete: true })?.header
  if (!header) throw new Error('Invalid token')
  const signingKey = await getKey(header.kid)
  return jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    audience: `api://${process.env.CLIENT_ID}`,
    issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
  })
}

function requireJwtAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  verify(token)
    .then(payload => {
      req.auth = payload
      next()
    })
    .catch(() => res.status(401).json({ error: 'Unauthorized' }))
}

module.exports = { requireJwtAuth }
