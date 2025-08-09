const AuthProvider = require('./AuthProvider')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const cookie = require('cookie-parser')

const users = new Map()

class LocalAuthProvider extends AuthProvider {
  constructor(config) {
    super(config)
    this.router.use(require('express').json())
    this.router.use(cookie())
    const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 })
    this.router.use(limiter)
    this.router.post('/register', this.register.bind(this))
    this.router.post('/login', this.login.bind(this))
    this.router.post('/logout', this.logout.bind(this))
    this.router.get('/me', (req, res) => {
      const user = this.getUserFromRequest(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      res.json({ id: user.id, email: user.email })
    })
  }

  async register(req, res) {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Invalid payload' })
    if (users.has(email)) return res.status(409).json({ error: 'User exists' })
    const hash = await bcrypt.hash(password, 10)
    users.set(email, { id: email, email, hash })
    res.json({ success: true })
  }

  async login(req, res) {
    const { email, password } = req.body || {}
    const user = users.get(email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email }, this.config.JWT_SECRET, { expiresIn: '1h' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: this.config.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    res.json({ success: true })
  }

  async logout(req, res) {
    res.clearCookie('token')
    res.json({ success: true })
  }

  getUserFromRequest(req) {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null
    try {
      return jwt.verify(token, this.config.JWT_SECRET)
    } catch {
      return null
    }
  }
}

module.exports = LocalAuthProvider
