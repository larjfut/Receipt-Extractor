import "@testing-library/jest-dom"
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../components/FileUpload.jsx'
import { checkImageQuality } from '../utils/imageQuality'
import { waitFor } from '@testing-library/react'

jest.mock('../utils/imageQuality', () => ({
  checkImageQuality: jest.fn()
}))

beforeEach(() => {
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

test('calls onFileSelected with quality data when a file is chosen', async () => {
  checkImageQuality.mockResolvedValue({ blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 })
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['hello'], 'test.png', { type: 'image/png' })
  await user.upload(input, file)
  await waitFor(() =>
    expect(handle).toHaveBeenCalledWith(file, { blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 })
  )
})

test('calls onFileSelected with quality data when a photo is taken', async () => {
  checkImageQuality.mockResolvedValue({ blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 })
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container, getByText } = render(<FileUpload onFileSelected={handle} />)
  const button = getByText(/take photo/i)
  const cameraInput = container.querySelector('input[capture="environment"]')
  const file = new File(['camera'], 'camera.png', { type: 'image/png' })
  await user.click(button)
  await user.upload(cameraInput, file)
  await waitFor(() =>
    expect(handle).toHaveBeenCalledWith(file, { blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 })
  )
})
