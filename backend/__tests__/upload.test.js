const request = require('supertest')

jest.mock('tesseract.js', () => ({
  recognize: jest.fn(() => Promise.resolve({ data: { text: '' } })),
}))

const app = require('../server')

describe('upload multiple files', () => {
  it('returns results for each file', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('files', Buffer.from('one'), 'one.png')
      .attach('files', Buffer.from('two'), 'two.png')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })
})
