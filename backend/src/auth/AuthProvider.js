class AuthProvider {
  constructor(config) {
    this.config = config
    this.router = require('express').Router()
  }
  async register(req, res) {
    res.status(501).json({ error: 'Not implemented' })
  }
  async login(req, res) {
    res.status(501).json({ error: 'Not implemented' })
  }
  async logout(req, res) {
    res.status(501).json({ error: 'Not implemented' })
  }
  getUserFromRequest(req) {
    return null
  }
  requireAuth = (req, res, next) => {
    const user = this.getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    next()
  }
}
module.exports = AuthProvider
