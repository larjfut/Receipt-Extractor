const AuthProvider = require('./AuthProvider')
const jwt = require('jsonwebtoken')

class MsalAuthProvider extends AuthProvider {
  constructor(config) {
    super(config)
    this.router.get('/me', (req, res) => {
      const user = this.getUserFromRequest(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      res.json(user)
    })
  }

  getUserFromRequest(req) {
    if (this.config.DEMO_MODE)
      return { id: 'demo', name: 'Demo User', email: 'demo@example.com' }
    let decoded = req.auth
    if (!decoded) {
      const header = req.headers.authorization
      if (!header || !header.startsWith('Bearer ')) return null
      try {
        decoded = jwt.decode(header.slice(7))
      } catch {
        return null
      }
    }
    return {
      id: decoded?.oid || null,
      name: decoded?.name || null,
      email: decoded?.preferred_username || null
    }
  }
}

module.exports = MsalAuthProvider
