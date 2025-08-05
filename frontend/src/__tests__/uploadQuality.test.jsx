import '@testing-library/jest-dom'
import { render, fireEvent, screen } from '@testing-library/react'
import UploadPage from '../pages/UploadPage.jsx'
import { ReceiptContext } from '../context/ReceiptContext.jsx'
import axios from 'axios'
import { checkImageQuality } from '../utils/imageQuality'
import { MemoryRouter } from 'react-router-dom'

jest.mock('axios')
jest.mock('../utils/imageQuality', () => ({
  checkImageQuality: jest.fn()
}))

const renderPage = () =>
  render(
    <ReceiptContext.Provider value={{ receipt: {}, setReceipt: jest.fn() }}>
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    </ReceiptContext.Provider>
  )

beforeEach(() => {
  axios.post.mockReset()
  global.URL.createObjectURL = jest.fn(() => 'blob:mock')
  global.Image = class {
    constructor () {
      setTimeout(() => {
        this.onload && this.onload()
      }, 0)
    }
    set src (_) {}
  }
})

test('rejects blurry image', async () => {
  checkImageQuality.mockResolvedValue({ blurVariance: 10, hasFourEdges: true, ocrConfidence: 90 })
  const { container } = renderPage()
  const file = new File(['blur'], 'blur.jpg', { type: 'image/jpeg' })
  fireEvent.change(container.querySelector('input[accept="image/*,application/pdf"]'), {
    target: { files: [file] }
  })
  await screen.findByText(/blurry/i)
  expect(axios.post).not.toHaveBeenCalled()
})

test('rejects image missing edges', async () => {
  checkImageQuality.mockResolvedValue({ blurVariance: 200, hasFourEdges: false, ocrConfidence: 90 })
  const { container } = renderPage()
  const file = new File(['edge'], 'edge.jpg', { type: 'image/jpeg' })
  fireEvent.change(container.querySelector('input[accept="image/*,application/pdf"]'), {
    target: { files: [file] }
  })
  await screen.findByText(/receipt edges not detected/i)
  expect(axios.post).not.toHaveBeenCalled()
})

test('rejects image with low OCR confidence', async () => {
  checkImageQuality.mockResolvedValue({ blurVariance: 200, hasFourEdges: true, ocrConfidence: 20 })
  const { container } = renderPage()
  const file = new File(['ocr'], 'ocr.jpg', { type: 'image/jpeg' })
  fireEvent.change(container.querySelector('input[accept="image/*,application/pdf"]'), {
    target: { files: [file] }
  })
  await screen.findByText(/text is not clear/i)
  expect(axios.post).not.toHaveBeenCalled()
})
