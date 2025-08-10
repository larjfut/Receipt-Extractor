import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import ReviewPage from '../pages/ReviewPage.jsx'
import { ReceiptContext } from '../context/ReceiptContext.jsx'

jest.mock('axios')

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  console.warn.mockRestore()
})

const renderPage = () => {
  const receipt = { fields: {}, contentTypeName: 'invoice' }
  const setReceipt = jest.fn()
  return render(
    <ReceiptContext.Provider value={{ receipt, setReceipt }}>
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    </ReceiptContext.Provider>
  )
}

test('loads field mapping', async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { stateKey: 'vendor', label: 'Vendor', dataType: 'text', required: true }
    ]
  })

  renderPage()
  expect(await screen.findByText('Vendor')).toBeInTheDocument()
})
