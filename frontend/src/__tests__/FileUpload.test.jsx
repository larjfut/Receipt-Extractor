import "@testing-library/jest-dom"
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../components/FileUpload.jsx'

test('calls onFileSelected when a file is chosen', async () => {
  const user = userEvent.setup()
  const handle = jest.fn()
  const { container } = render(<FileUpload onFileSelected={handle} />)
  const input = container.querySelector('input[type="file"]')
  const file = new File(['hello'], 'test.png', { type: 'image/png' })
  await user.upload(input, file)
  expect(handle).toHaveBeenCalledWith(file)
})
