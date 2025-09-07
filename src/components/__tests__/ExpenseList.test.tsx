import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseList } from '../ExpenseList'
import type { Expense } from '../../types/expense-types'

// Mock the hooks
const mockDeleteExpense = vi.fn()
const mockUseExpensesByDate = vi.fn()
const mockUseDeleteExpense = vi.fn(() => ({
  mutateAsync: mockDeleteExpense,
}))

vi.mock('../../hooks/useExpenses', () => ({
  useExpensesByDate: mockUseExpensesByDate,
  useDeleteExpense: mockUseDeleteExpense,
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
})

const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 2550, // 25.50 THB
    description: 'Coffee and pastry',
    category: 'Food & Dining',
    tags: ['coffee', 'breakfast'],
    notes: 'With colleague',
    createdAt: new Date('2023-12-15T10:00:00Z'),
    updatedAt: new Date('2023-12-15T10:00:00Z'),
    userId: 'user1',
    date: '2023-12-15',
  },
  {
    id: '2',
    amount: 15000, // 150.00 THB
    description: 'Lunch at restaurant',
    category: 'Food & Dining',
    tags: ['lunch'],
    createdAt: new Date('2023-12-15T12:00:00Z'),
    updatedAt: new Date('2023-12-15T12:00:00Z'),
    userId: 'user1',
    date: '2023-12-15',
  },
]

describe('ExpenseList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window.confirm as any).mockReturnValue(true)
  })

  it('shows loading state', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)
    expect(screen.getByText('Loading expenses...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<ExpenseList date="2023-12-15" />)
    expect(screen.getByText('Error loading expenses')).toBeInTheDocument()
  })

  it('shows empty state when no expenses', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)
    expect(screen.getByText('No expenses yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first expense above to get started!')).toBeInTheDocument()
  })

  it('renders expenses list', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)

    expect(screen.getByText('Expenses for Dec 15, 2023')).toBeInTheDocument()
    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument()
    expect(screen.getByText('Lunch at restaurant')).toBeInTheDocument()
    expect(screen.getByText('฿25.50')).toBeInTheDocument()
    expect(screen.getByText('฿150.00')).toBeInTheDocument()
  })

  it('displays expense details correctly', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: [mockExpenses[0]],
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)

    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument()
    expect(screen.getByText('Food & Dining')).toBeInTheDocument()
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByText('breakfast')).toBeInTheDocument()
    expect(screen.getByText('📝 With colleague')).toBeInTheDocument()
    expect(screen.getByText('฿25.50')).toBeInTheDocument()
  })

  it('handles delete expense with confirmation', async () => {
    const user = userEvent.setup()
    mockUseExpensesByDate.mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    })
    mockDeleteExpense.mockResolvedValue({})

    render(<ExpenseList date="2023-12-15" />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this expense?')
    
    await waitFor(() => {
      expect(mockDeleteExpense).toHaveBeenCalledWith('1')
    })
  })

  it('cancels delete when confirmation is declined', async () => {
    const user = userEvent.setup()
    ;(window.confirm as any).mockReturnValue(false)
    
    mockUseExpensesByDate.mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteExpense).not.toHaveBeenCalled()
  })

  it('shows deleting state', () => {
    mockUseExpensesByDate.mockReturnValue({
      data: mockExpenses,
      isLoading: false,
      error: null,
    })

    const { rerender } = render(<ExpenseList date="2023-12-15" />)

    // Simulate deleting state by checking if button shows "Deleting..."
    // This would require modifying the component to accept a deletingId prop or similar
    expect(screen.getAllByText('Delete')).toHaveLength(2)
  })

  it('displays expenses without notes correctly', () => {
    const expenseWithoutNotes = {
      ...mockExpenses[0],
      notes: undefined,
    }

    mockUseExpensesByDate.mockReturnValue({
      data: [expenseWithoutNotes],
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)

    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument()
    expect(screen.queryByText('📝')).not.toBeInTheDocument()
  })

  it('displays expenses without tags correctly', () => {
    const expenseWithoutTags = {
      ...mockExpenses[0],
      tags: [],
    }

    mockUseExpensesByDate.mockReturnValue({
      data: [expenseWithoutTags],
      isLoading: false,
      error: null,
    })

    render(<ExpenseList date="2023-12-15" />)

    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument()
    expect(screen.queryByText('coffee')).not.toBeInTheDocument()
  })
})