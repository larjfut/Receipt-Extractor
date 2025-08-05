import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../components/FileUpload.jsx'
import { checkImageQuality } from '../utils/imageQuality.js'

jest.mock('../utils/imageQuality.js', () => ({
  checkImageQuality: jest.fn()
}))

test('calls onFileSelected when a file passes quality check', async () => {
  checkImageQuality.mockResolvedValue({ ok: true, issues: [] })
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['hello'], 'test.png', { type: 'image/png' })
  await user.upload(input, file)
  expect(handle).toHaveBeenCalledWith(file)
})

test('shows retake message when quality check fails', async () => {
  checkImageQuality.mockResolvedValue({ ok: false, issues: ['Image is blurry'] })
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[accept="image/*,application/pdf"]')
  const file = new File(['bad'], 'bad.png', { type: 'image/png' })
  await user.upload(input, file)
  expect(handle).not.toHaveBeenCalled()
  expect(await screen.findByText(/retake/i)).toBeInTheDocument()
})
