import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../components/FileUpload.jsx'
import { checkImageQuality } from '../utils/imageQuality'

jest.mock('../utils/imageQuality', () => ({
  checkImageQuality: jest.fn(),
}))

beforeEach(() => {
  checkImageQuality.mockImplementation(() =>
    Promise.resolve({
      blurVariance: 200,
      hasFourEdges: true,
      ocrConfidence: 90,
    })
  )
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

test('calls onFileSelected with array when a file is chosen', async () => {
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['hello'], 'test.png', { type: 'image/png' })
  await user.upload(input, file)
  await waitFor(() =>
    expect(handle).toHaveBeenCalledWith([
      {
        file,
        quality: { blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 },
      },
    ])
  )
})

test('calls onFileSelected with array when a photo is taken', async () => {
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container, getByText } = render(<FileUpload onFileSelected={handle} />)
  const button = getByText(/take photo/i)
  const cameraInput = container.querySelector('input[capture="environment"]')
  const file = new File(['camera'], 'camera.png', { type: 'image/png' })
  await user.click(button)
  await user.upload(cameraInput, file)
  await waitFor(() =>
    expect(handle).toHaveBeenCalledWith([
      {
        file,
        quality: { blurVariance: 200, hasFourEdges: true, ocrConfidence: 90 },
      },
    ])
  )
})

test('handles multiple file selection', async () => {
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const files = [
    new File(['one'], 'one.png', { type: 'image/png' }),
    new File(['two'], 'two.png', { type: 'image/png' }),
  ]
  await user.upload(input, files)
  await waitFor(() => expect(handle).toHaveBeenCalledTimes(1))
  const result = handle.mock.calls[0][0]
  expect(Array.isArray(result)).toBe(true)
  expect(result).toHaveLength(2)
  expect(result[0].file).toBe(files[0])
  expect(result[1].file).toBe(files[1])
})
