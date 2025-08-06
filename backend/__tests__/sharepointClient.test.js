const mockApiCalls = []
const mockPost = jest.fn()
const mockPut = jest.fn()

jest.mock('@azure/identity', () => ({
  ClientSecretCredential: jest.fn().mockImplementation(() => ({
    getToken: jest.fn(() => Promise.resolve({ token: 'token' })),
  })),
}))

jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    initWithMiddleware: jest.fn(() => ({
      api: (path) => {
        mockApiCalls.push(path)
        return { post: mockPost, put: mockPut }
      },
    })),
  },
}))

describe('createPurchaseRequisition attachments', () => {
  beforeEach(() => {
    jest.resetModules()
    mockApiCalls.length = 0
    mockPost.mockReset()
    mockPut.mockReset()
    process.env.TENANT_ID = 't'
    process.env.CLIENT_ID = 'c'
    process.env.CLIENT_SECRET = 's'
    process.env.SITE_ID = 'site'
    process.env.LIST_ID = 'list'
  })

  it('uploads attachment content', async () => {
    const { createPurchaseRequisition } = require('../sharepointClient')
    const base64 = Buffer.from('hello').toString('base64')
    mockPost.mockResolvedValueOnce({ id: 'item1' })

    await createPurchaseRequisition(
      {},
      [{ name: 'file.txt', type: 'text/plain', content: base64 }],
      null
    )

    expect(mockApiCalls).toContain('/sites/site/lists/list/items')
    expect(mockApiCalls).toContain(
      '/sites/site/lists/list/items/item1/attachments/file.txt/$value'
    )
    expect(mockPut).toHaveBeenCalledWith(Buffer.from(base64, 'base64'))
  })
})
