const request = require('supertest')

jest.mock('../docIntelligenceClient', () => ({
  analyzeDocument: jest.fn(() =>
    Promise.resolve({
      documents: [
        {
          fields: {
            VendorName: { content: 'Vendor Inc', confidence: 0.8 },
            InvoiceTotal: { content: '$10.00', confidence: 0.8 },
            InvoiceDate: { content: '08/06/2025', confidence: 0.8 },
            VendorAddress: { content: '', confidence: 0.9 },
            InvoiceId: { content: '123', confidence: 0.6 }
          }
        }
      ],
      tables: [
        {
          rowCount: 2,
          columnCount: 3,
          cells: [
            { rowIndex: 0, columnIndex: 0, content: 'Date' },
            { rowIndex: 0, columnIndex: 1, content: 'Invoice #' },
            { rowIndex: 0, columnIndex: 2, content: 'Total' },
            { rowIndex: 1, columnIndex: 0, content: '08/06/2025' },
            { rowIndex: 1, columnIndex: 1, content: 'INV-1' },
            { rowIndex: 1, columnIndex: 2, content: '$10.00' }
          ]
        }
      ]
    })
  )
}))

process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT = 'https://example.com'
process.env.AZURE_DOC_INTELLIGENCE_KEY = 'test-key'
const app = require('../server')

describe('upload multiple files', () => {
  it('applies field mapping and transformations', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field(
        'selectedContentType',
        JSON.stringify({ Name: 'Purchase Requisition - Vendor Invoice' })
      )
      .attach('files', Buffer.from('one'), 'one.png')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    const first = res.body[0]
    expect(first.data.vendorName).toBe('Vendor Inc')
    expect(first.data.grandTotal).toBe(10)
    expect(first.data.invoiceDate).toBe('2025-08-06')
    expect(first.confidence.vendorName).toBe(0.8)
    expect(first.data.vendorAddress).toBeUndefined()
    expect(first.data.invoiceId).toBeUndefined()
    expect(first.lineItems[0].Date).toBe('2025-08-06')
    expect(first.lineItems[0].Total).toBe(10)
  })
})
