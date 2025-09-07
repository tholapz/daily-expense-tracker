import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { ExpenseForm } from '../../components/ExpenseForm'
import { ExpenseList } from '../../components/ExpenseList'
import { DayTotal } from '../../components/DayTotal'
import type { Expense } from '../../types/expense-types'

// Mock Firebase and Auth
const mockCurrentUser = {
  uid: 'test-user-123',
  displayName: 'Test User',
  email: 'test@example.com',
}

const mockUseAuth = vi.fn(() => ({
  currentUser: mockCurrentUser,
  loading: false,
  signInWithGoogle: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: mockUseAuth,
}))

// Mock the expense hooks with realistic behavior
let mockExpenses: Expense[] = []
let mockDayTotal = 0

const mockUseExpensesByDate = vi.fn(() => ({
  data: mockExpenses,
  isLoading: false,
  error: null,
}))

const mockUseDayTotal = vi.fn(() => ({
  data: mockDayTotal,
  isLoading: false,
}))

const mockCreateExpense = vi.fn()
const mockUseCreateExpense = vi.fn(() => ({
  mutateAsync: mockCreateExpense,
  isPending: false,
}))

const mockDeleteExpense = vi.fn()
const mockUseDeleteExpense = vi.fn(() => ({
  mutateAsync: mockDeleteExpense,
}))

vi.mock('../../hooks/useExpenses', () => ({
  useExpensesByDate: mockUseExpensesByDate,
  useDayTotal: mockUseDayTotal,
  useCreateExpense: mockUseCreateExpense,
  useDeleteExpense: mockUseDeleteExpense,
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Expense Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExpenses = []
    mockDayTotal = 0
    ;(window.confirm as any).mockReturnValue(true)
  })

  it('completes full expense workflow: add, view, and delete', async () => {
    const user = userEvent.setup()

    // Mock successful expense creation
    mockCreateExpense.mockImplementation(async (expenseData) => {
      const newExpense: Expense = {
        id: 'expense-123',
        ...expenseData,
        userId: mockCurrentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Simulate optimistic update
      mockExpenses = [newExpense]
      mockDayTotal += expenseData.amount
      
      return newExpense
    })

    // Mock successful expense deletion
    mockDeleteExpense.mockImplementation(async (expenseId) => {
      const expenseToDelete = mockExpenses.find(e => e.id === expenseId)
      if (expenseToDelete) {
        mockExpenses = mockExpenses.filter(e => e.id !== expenseId)
        mockDayTotal -= expenseToDelete.amount
      }
    })

    // Render the expense tracking components
    render(
      <TestWrapper>
        <div>
          <DayTotal date="2023-12-15" />
          <ExpenseForm />
          <ExpenseList date="2023-12-15" />
        </div>
      </TestWrapper>
    )

    // Step 1: Verify initial state (empty)
    expect(screen.getByText('฿0.00')).toBeInTheDocument() // Day total
    expect(screen.getByText('No expenses yet')).toBeInTheDocument()

    // Step 2: Add a new expense
    await user.type(screen.getByLabelText(/amount/i), '25.50')
    await user.type(screen.getByLabelText(/description/i), 'Coffee and pastry')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food & Dining')
    await user.type(screen.getByLabelText(/tags/i), 'coffee, breakfast')
    await user.type(screen.getByLabelText(/notes/i), 'Morning coffee break')

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    // Verify expense creation was called with correct data
    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledWith({
        amount: 2550, // 25.50 * 100
        description: 'Coffee and pastry',
        category: 'Food & Dining',
        tags: ['coffee', 'breakfast'],
        notes: 'Morning coffee break',
        date: expect.any(String),
      })
    })

    // Step 3: Verify expense appears in list and day total updates
    // Re-render with updated data
    render(
      <TestWrapper>
        <div>
          <DayTotal date="2023-12-15" />
          <ExpenseList date="2023-12-15" />
        </div>
      </TestWrapper>
    )

    expect(screen.getByText('Coffee and pastry')).toBeInTheDocument()
    expect(screen.getByText('Food & Dining')).toBeInTheDocument()
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByText('breakfast')).toBeInTheDocument()
    expect(screen.getByText('📝 Morning coffee break')).toBeInTheDocument()
    expect(screen.getByText('฿25.50')).toBeInTheDocument()

    // Step 4: Delete the expense
    await user.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this expense?')
      expect(mockDeleteExpense).toHaveBeenCalledWith('expense-123')
    })

    // Step 5: Verify expense is removed and day total resets
    // Re-render with updated data
    render(
      <TestWrapper>
        <div>
          <DayTotal date="2023-12-15" />
          <ExpenseList date="2023-12-15" />
        </div>
      </TestWrapper>
    )

    expect(screen.getByText('฿0.00')).toBeInTheDocument()
    expect(screen.getByText('No expenses yet')).toBeInTheDocument()
  })

  it('handles multiple expenses and calculates correct totals', async () => {
    const user = userEvent.setup()

    // Mock multiple expenses
    const expenses: Expense[] = [
      {
        id: '1',
        amount: 2500, // 25.00
        description: 'Lunch',
        category: 'Food & Dining',
        tags: ['lunch'],
        userId: mockCurrentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        date: '2023-12-15',
      },
      {
        id: '2',
        amount: 1500, // 15.00
        description: 'Coffee',
        category: 'Food & Dining',
        tags: ['coffee'],
        userId: mockCurrentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        date: '2023-12-15',
      }
    ]

    mockExpenses = expenses
    mockDayTotal = 4000 // 40.00 THB total

    render(
      <TestWrapper>
        <div>
          <DayTotal date="2023-12-15" />
          <ExpenseList date="2023-12-15" />
        </div>
      </TestWrapper>
    )

    // Verify both expenses are displayed
    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('฾40.00')).toBeInTheDocument() // Total amount

    // Verify individual amounts
    expect(screen.getByText('฿25.00')).toBeInTheDocument()
    expect(screen.getByText('฿15.00')).toBeInTheDocument()
  })

  it('handles form validation properly', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ExpenseForm />
      </TestWrapper>
    )

    // Try to submit form without required fields
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    // Should not call create expense
    expect(mockCreateExpense).not.toHaveBeenCalled()
  })

  it('displays loading states correctly', () => {
    // Mock loading state
    mockUseExpensesByDate.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    mockUseDayTotal.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    render(
      <TestWrapper>
        <div>
          <DayTotal date="2023-12-15" />
          <ExpenseList date="2023-12-15" />
        </div>
      </TestWrapper>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument() // Day total loading
    expect(screen.getByText('Loading expenses...')).toBeInTheDocument() // Expense list loading
  })

  it('handles error states gracefully', () => {
    // Mock error state
    mockUseExpensesByDate.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load expenses'),
    })

    render(
      <TestWrapper>
        <ExpenseList date="2023-12-15" />
      </TestWrapper>
    )

    expect(screen.getByText('Error loading expenses')).toBeInTheDocument()
  })

  it('cancels delete when user declines confirmation', async () => {
    const user = userEvent.setup()
    ;(window.confirm as any).mockReturnValue(false)

    const expense: Expense = {
      id: 'expense-123',
      amount: 2500,
      description: 'Test expense',
      category: 'Food & Dining',
      tags: [],
      userId: mockCurrentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: '2023-12-15',
    }

    mockExpenses = [expense]

    render(
      <TestWrapper>
        <ExpenseList date="2023-12-15" />
      </TestWrapper>
    )

    await user.click(screen.getByText('Delete'))

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteExpense).not.toHaveBeenCalled()
  })
})