import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import ReviewPage from '../pages/ReviewPage.jsx'
import { ReceiptContext } from '../context/ReceiptContext.jsx'

jest.mock('axios')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderPage = () => {
  const receipt = { fields: {}, contentTypeName: 'invoice' }
  const setReceipt = jest.fn(update => {
    Object.assign(
      receipt,
      typeof update === 'function' ? update(receipt) : update
    )
  })
  return render(
    <ReceiptContext.Provider value={{ receipt, setReceipt }}>
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    </ReceiptContext.Provider>
  )
}

test('loads field mapping, validates input, and navigates on submit', async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      {
        stateKey: 'vendor',
        label: 'Vendor',
        dataType: 'text',
        required: true,
      },
    ],
  })

  expect(() => renderPage()).not.toThrow()
  expect(await screen.findByText('Vendor')).toBeInTheDocument()

  fireEvent.click(
    screen.getByRole('button', { name: /continue to signature/i })
  )
  expect(
    await screen.findByText(/vendor is required/i)
  ).toBeInTheDocument()

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'ACME' },
  })
  fireEvent.click(
    screen.getByRole('button', { name: /continue to signature/i })
  )
  expect(mockNavigate).toHaveBeenCalledWith('/signature')
})
