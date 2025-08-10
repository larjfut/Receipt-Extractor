import '@testing-library/jest-dom'
import { render, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../components/FileUpload.jsx'
import { checkImageQuality } from '../utils/imageQuality'
import { QUALITY_MESSAGES } from '../utils/qualityMessages'

jest.mock('../utils/imageQuality', () => ({
  checkImageQuality: jest.fn(),
}))

jest.mock('pdfjs-dist/build/pdf', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      getPage: () =>
        Promise.resolve({
          getViewport: () => ({ width: 100, height: 100 }),
          render: () => ({ promise: Promise.resolve() }),
        }),
    }),
  }),
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
  global.URL.revokeObjectURL = jest.fn()
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
  await act(async () => {
    await user.upload(input, file)
  })
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
  await act(async () => {
    await user.click(button)
    await user.upload(cameraInput, file)
  })
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
  await act(async () => {
    await user.upload(input, files)
  })
  await waitFor(() => expect(handle).toHaveBeenCalledTimes(1))
  const result = handle.mock.calls[0][0]
  expect(Array.isArray(result)).toBe(true)
  expect(result).toHaveLength(2)
  expect(result[0].file).toBe(files[0])
  expect(result[1].file).toBe(files[1])
})

test('renders image preview for uploaded image', async () => {
  const user = userEvent.setup()
  const { container } = render(<FileUpload onFileSelected={() => {}} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['img'], 'img.png', { type: 'image/png' })
  await act(async () => {
    await user.upload(input, file)
  })
  await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument())
})

test('renders pdf preview for uploaded pdf', async () => {
  const user = userEvent.setup()
  const { container } = render(<FileUpload onFileSelected={() => {}} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['pdf'], 'test.pdf', { type: 'application/pdf' })
  await act(async () => {
    await user.upload(input, file)
  })
  await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
})

test('shows ready status after quality check', async () => {
  const user = userEvent.setup()
  const { container } = render(
    <FileUpload onFileSelected={() => {}} />
  )
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['ok'], 'ok.png', { type: 'image/png' })
  await act(async () => {
    await user.upload(input, file)
  })
  await waitFor(() => expect(container).toHaveTextContent(/ready/i))
})

test('shows unreadable status with reason', async () => {
  checkImageQuality.mockResolvedValueOnce({
    blurVariance: 10,
    hasFourEdges: true,
    ocrConfidence: 90,
  })
  const user = userEvent.setup()
  const { container, getByTitle } = render(
    <FileUpload onFileSelected={() => {}} />
  )
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['bad'], 'bad.png', { type: 'image/png' })
  await act(async () => {
    await user.upload(input, file)
  })
  await waitFor(() => expect(container).toHaveTextContent(/unreadable/i))
  const icon = getByTitle(QUALITY_MESSAGES.blur)
  expect(icon).toBeInTheDocument()
  expect(icon.querySelector('svg')).toBeInTheDocument()
})
