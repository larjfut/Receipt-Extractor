const request = require('supertest')
const jwt = require('jsonwebtoken')
jest.mock('../sharepointClient', () => ({
  createItemWithContentType: jest.fn(() => Promise.resolve({ id: 'item' })),
  listActiveUsers: jest.fn(() => Promise.resolve([])),
  listContentTypes: jest.fn(() => Promise.resolve([])),
}))
const { createItemWithContentType } = require('../sharepointClient')
process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT = 'https://example.com'
process.env.AZURE_DOC_INTELLIGENCE_KEY = 'test-key'
process.env.JWT_SECRET = 'test-secret'
const token = jwt.sign({ sub: 'tester' }, process.env.JWT_SECRET)
const app = require('../server')
const fieldMapping = require('../fieldMapping.json')
const personalCardMapping = require('../fieldMappings/personal-card.json')

describe('server routes', () => {
  it('returns field mapping', async () => {
    const res = await request(app).get('/api/fields')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(fieldMapping)
  })

  it('returns mapping by content type', async () => {
    const res = await request(app)
      .get('/api/fields')
      .query({ contentType: 'Personal Card' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual(personalCardMapping)
  })

  it('returns 404 for unknown content type', async () => {
    const res = await request(app)
      .get('/api/fields')
      .query({ contentType: 'Unknown' })
    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
  })

  it('rejects upload without file', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  it('requires auth for upload', async () => {
    const res = await request(app).post('/api/upload')
    expect(res.status).toBe(401)
  })

  it('submits stub data', async () => {
    const res = await request(app)
      .post('/api/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fields: {},
        attachments: [],
        signature: null,
        contentTypeId: 'ct',
      })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('requires auth for submit', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({})
    expect(res.status).toBe(401)
  })

  it('passes attachment content to sharepoint client', async () => {
    const attachment = {
      name: 'file.txt',
      type: 'text/plain',
      content: Buffer.from('hi').toString('base64'),
    }
    const res = await request(app)
      .post('/api/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fields: {},
        attachments: [attachment],
        signature: null,
        contentTypeId: 'ct',
      })
    expect(res.status).toBe(200)
    expect(createItemWithContentType).toHaveBeenCalledWith(
      {},
      [attachment],
      'ct',
    )
  })

  it('lists users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('requires auth for users', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(401)
  })

  it('lists content types', async () => {
    const res = await request(app)
      .get('/api/content-types')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('requires auth for content types', async () => {
    const res = await request(app).get('/api/content-types')
    expect(res.status).toBe(401)
  })
})
