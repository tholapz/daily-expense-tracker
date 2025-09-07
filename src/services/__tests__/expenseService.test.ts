import { describe, it, expect, vi, beforeEach } from 'vitest'
import { expenseService } from '../expenseService'
import type { CreateExpenseInput } from '../../types/expense-types'

// Mock Firebase functions
const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockGetDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockCollection = vi.fn()
const mockDoc = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockServerTimestamp = vi.fn(() => ({ _methodName: 'serverTimestamp' }))

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  serverTimestamp: mockServerTimestamp,
}))

vi.mock('../../lib/firebase', () => ({
  firestore: { _firebase: 'mock' }
}))

describe('expenseService', () => {
  const userId = 'user123'
  const mockExpenseData: CreateExpenseInput = {
    amount: 2500,
    description: 'Test expense',
    category: 'Food & Dining',
    tags: ['test'],
    notes: 'Test notes',
    date: '2023-12-15',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCollection.mockReturnValue('mockCollection')
    mockDoc.mockReturnValue('mockDocRef')
    mockQuery.mockReturnValue('mockQuery')
    mockWhere.mockReturnValue('mockWhere')
    mockOrderBy.mockReturnValue('mockOrderBy')
    mockLimit.mockReturnValue('mockLimit')
  })

  describe('createExpense', () => {
    it('creates expense successfully', async () => {
      const mockDocRef = { id: 'expense123' }
      mockAddDoc.mockResolvedValue(mockDocRef)
      mockUpdateDoc.mockResolvedValue({})

      const result = await expenseService.createExpense(userId, mockExpenseData)

      expect(mockCollection).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        userId,
        'expenses'
      )
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mockCollection',
        expect.objectContaining({
          ...mockExpenseData,
          userId,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      )

      expect(result.id).toBe('expense123')
      expect(result.amount).toBe(2500)
      expect(result.description).toBe('Test expense')
    })

    it('updates day total after creating expense', async () => {
      const mockDocRef = { id: 'expense123' }
      mockAddDoc.mockResolvedValue(mockDocRef)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalAmount: 5000 })
      })
      mockUpdateDoc.mockResolvedValue({})

      await expenseService.createExpense(userId, mockExpenseData)

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1) // Called for day total update
    })
  })

  describe('updateExpense', () => {
    it('updates expense successfully', async () => {
      const updateData = {
        id: 'expense123',
        amount: 3000,
        description: 'Updated expense',
      }

      mockUpdateDoc.mockResolvedValue({})

      await expenseService.updateExpense(userId, updateData)

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        userId,
        'expenses',
        'expense123'
      )
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mockDocRef',
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Object),
        })
      )
    })
  })

  describe('deleteExpense', () => {
    it('deletes expense and updates day total', async () => {
      const expenseId = 'expense123'
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          amount: 2500,
          date: '2023-12-15',
        })
      })
      mockDeleteDoc.mockResolvedValue({})
      mockUpdateDoc.mockResolvedValue({})

      await expenseService.deleteExpense(userId, expenseId)

      expect(mockDeleteDoc).toHaveBeenCalledWith('mockDocRef')
      expect(mockUpdateDoc).toHaveBeenCalled() // Day total update
    })

    it('handles non-existent expense gracefully', async () => {
      const expenseId = 'nonexistent'
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      })

      await expenseService.deleteExpense(userId, expenseId)

      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })
  })

  describe('getExpensesByDate', () => {
    it('retrieves expenses for specific date', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'expense1',
            data: () => ({
              amount: 2500,
              description: 'Expense 1',
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            })
          }
        ]
      }
      
      mockGetDocs.mockResolvedValue(mockSnapshot)

      const expenses = await expenseService.getExpensesByDate(userId, '2023-12-15')

      expect(mockQuery).toHaveBeenCalledWith(
        'mockCollection',
        'mockWhere',
        'mockOrderBy'
      )
      expect(mockWhere).toHaveBeenCalledWith('date', '==', '2023-12-15')
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc')
      expect(expenses).toHaveLength(1)
      expect(expenses[0].id).toBe('expense1')
    })

    it('returns empty array when no expenses found', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] })

      const expenses = await expenseService.getExpensesByDate(userId, '2023-12-15')

      expect(expenses).toEqual([])
    })
  })

  describe('getRecentExpenses', () => {
    it('retrieves recent expenses with default limit', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'expense1',
            data: () => ({
              amount: 2500,
              description: 'Recent expense',
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            })
          }
        ]
      }
      
      mockGetDocs.mockResolvedValue(mockSnapshot)

      const expenses = await expenseService.getRecentExpenses(userId)

      expect(mockLimit).toHaveBeenCalledWith(50)
      expect(expenses).toHaveLength(1)
    })

    it('retrieves recent expenses with custom limit', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] })

      await expenseService.getRecentExpenses(userId, 10)

      expect(mockLimit).toHaveBeenCalledWith(10)
    })
  })

  describe('updateDayTotal', () => {
    it('updates existing day total', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalAmount: 5000 })
      })
      mockUpdateDoc.mockResolvedValue({})

      await expenseService.updateDayTotal(userId, '2023-12-15', 2500)

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mockDocRef',
        expect.objectContaining({
          totalAmount: 7500, // 5000 + 2500
          updatedAt: expect.any(Object),
        })
      )
    })

    it('creates new day total when none exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      })
      mockUpdateDoc.mockResolvedValue({})

      await expenseService.updateDayTotal(userId, '2023-12-15', 2500)

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mockDocRef',
        expect.objectContaining({
          id: '20231215',
          date: '2023-12-15',
          totalAmount: 2500,
          userId,
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        })
      )
    })
  })

  describe('getDayTotal', () => {
    it('returns existing day total', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalAmount: 5000 })
      })

      const total = await expenseService.getDayTotal(userId, '2023-12-15')

      expect(total).toBe(5000)
    })

    it('returns 0 when no day total exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      })

      const total = await expenseService.getDayTotal(userId, '2023-12-15')

      expect(total).toBe(0)
    })

    it('returns 0 when day total is undefined', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ totalAmount: undefined })
      })

      const total = await expenseService.getDayTotal(userId, '2023-12-15')

      expect(total).toBe(0)
    })
  })
})