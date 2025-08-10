import "@testing-library/jest-dom"
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

jest.mock('../components/Header', () => () => <div />)

import App from '../App.jsx'

test('shows home page by default', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByText(/welcome/i)).toBeInTheDocument()
})
