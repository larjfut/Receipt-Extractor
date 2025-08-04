const request = require('supertest')
const app = require('../server')
const fieldMapping = require('../fieldMapping.json')

describe('server routes', () => {
  it('returns field mapping', async () => {
    const res = await request(app).get('/api/fields')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(fieldMapping)
  })

  it('rejects upload without file', async () => {
    const res = await request(app).post('/api/upload')
    expect(res.status).toBe(400)
  })

  it('submits stub data', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ fields: {}, attachments: [], signature: null })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('lists users', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
