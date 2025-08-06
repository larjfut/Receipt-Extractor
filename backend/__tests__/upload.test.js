const request = require('supertest')

jest.mock('../docIntelligenceClient', () => ({
  analyzeDocument: jest.fn(() =>
    Promise.resolve({
      documents: [
        {
          fields: {
            MerchantName: { content: 'Shop', confidence: 0.8 }
          }
        }
      ]
    })
  )
}))

process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT = 'https://example.com'
process.env.AZURE_DOC_INTELLIGENCE_KEY = 'test-key'
const app = require('../server')

describe('upload multiple files', () => {
  it('returns results for each file', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field('selectedContentType', JSON.stringify({ Name: 'Receipt' }))
      .attach('files', Buffer.from('one'), 'one.png')
      .attach('files', Buffer.from('two'), 'two.png')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].data.MerchantName).toBe('Shop')
    expect(res.body[0].confidence.MerchantName).toBe(0.8)
  })
})
