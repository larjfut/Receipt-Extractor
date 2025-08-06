const request = require('supertest')
jest.mock('../sharepointClient', () => ({
  createItemWithContentType: jest.fn(() => Promise.resolve({ id: 'item' })),
  listActiveUsers: jest.fn(() => Promise.resolve([])),
  listContentTypes: jest.fn(() => Promise.resolve([])),
}))
const { createItemWithContentType } = require('../sharepointClient')
process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT = 'https://example.com'
process.env.AZURE_DOC_INTELLIGENCE_KEY = 'test-key'
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
      .send({ fields: {}, attachments: [], signature: null, contentTypeId: 'ct' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('passes attachment content to sharepoint client', async () => {
    const attachment = {
      name: 'file.txt',
      type: 'text/plain',
      content: Buffer.from('hi').toString('base64'),
    }
    const res = await request(app)
      .post('/api/submit')
      .send({ fields: {}, attachments: [attachment], signature: null, contentTypeId: 'ct' })
    expect(res.status).toBe(200)
    expect(createItemWithContentType).toHaveBeenCalledWith(
      {},
      [attachment],
      'ct'
    )
  })

  it('lists users', async () => {
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('lists content types', async () => {
    const res = await request(app).get('/api/content-types')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
