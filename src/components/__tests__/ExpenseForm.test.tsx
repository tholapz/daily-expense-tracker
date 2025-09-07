import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '../ExpenseForm'

// Mock the hooks
const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useExpenses', () => ({
  useCreateExpense: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}))

describe('ExpenseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('shows form title', () => {
    render(<ExpenseForm />)
    expect(screen.getByText('Add New Expense')).toBeInTheDocument()
  })

  it('has default category selected', () => {
    render(<ExpenseForm />)
    const categorySelect = screen.getByDisplayValue('Food & Dining')
    expect(categorySelect).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})

    render(<ExpenseForm />)

    // Fill in form data
    await user.type(screen.getByLabelText(/amount/i), '25.50')
    await user.type(screen.getByLabelText(/description/i), 'Coffee and pastry')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food & Dining')
    await user.type(screen.getByLabelText(/tags/i), 'coffee, breakfast')
    await user.type(screen.getByLabelText(/notes/i), 'With colleague at cafe')

    // Submit form
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        amount: 2550, // 25.50 * 100
        description: 'Coffee and pastry',
        category: 'Food & Dining',
        tags: ['coffee', 'breakfast'],
        notes: 'With colleague at cafe',
        date: expect.any(String),
      })
    })
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})

    render(<ExpenseForm />)

    // Fill in form data
    await user.type(screen.getByLabelText(/amount/i), '25.50')
    await user.type(screen.getByLabelText(/description/i), 'Coffee and pastry')

    // Submit form
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toHaveValue('')
      expect(screen.getByLabelText(/description/i)).toHaveValue('')
    })
  })

  it('handles tags correctly', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})

    render(<ExpenseForm />)

    await user.type(screen.getByLabelText(/amount/i), '10')
    await user.type(screen.getByLabelText(/description/i), 'Test')
    await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2, tag3')

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'],
        })
      )
    })
  })

  it('handles empty tags', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})

    render(<ExpenseForm />)

    await user.type(screen.getByLabelText(/amount/i), '10')
    await user.type(screen.getByLabelText(/description/i), 'Test')

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: [],
        })
      )
    })
  })

  it('shows loading state when submitting', () => {
    const { useCreateExpense } = vi.mocked(await import('../../hooks/useExpenses'))
    useCreateExpense.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    })

    render(<ExpenseForm />)

    expect(screen.getByText('Adding...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('prevents submission with missing required fields', async () => {
    const user = userEvent.setup()
    
    render(<ExpenseForm />)

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})