import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the hooks before importing the component
vi.mock('../../hooks/useExpenses', () => ({
  useCreateExpense: vi.fn(),
}))

import { ExpenseForm } from '../ExpenseForm'
import { useCreateExpense } from '../../hooks/useExpenses'

const mockUseCreateExpense = vi.mocked(useCreateExpense)

describe('ExpenseForm', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateExpense.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any)
  })

  it('renders all form fields', () => {
    render(<ExpenseForm />)

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})

    render(<ExpenseForm />)

    await user.type(screen.getByLabelText(/amount/i), '25.50')
    await user.type(screen.getByLabelText(/description/i), 'Coffee and pastry')

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2550,
          description: 'Coffee and pastry',
          category: 'Food & Dining',
        })
      )
    })
  })

  it('shows loading state', () => {
    mockUseCreateExpense.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any)

    render(<ExpenseForm />)

    expect(screen.getByText('Adding...')).toBeInTheDocument()
  })
})