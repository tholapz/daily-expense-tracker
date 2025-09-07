import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayTotal } from '../DayTotal'

// Mock the hooks
const mockUseDayTotal = vi.fn()

vi.mock('../../hooks/useExpenses', () => ({
  useDayTotal: mockUseDayTotal,
}))

describe('DayTotal', () => {
  it('shows loading state', () => {
    mockUseDayTotal.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('Daily Total')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays total amount when loaded', () => {
    mockUseDayTotal.mockReturnValue({
      data: 25000, // 250.00 THB
      isLoading: false,
    })

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('Daily Total - Dec 15, 2023')).toBeInTheDocument()
    expect(screen.getByText('฿250.00')).toBeInTheDocument()
  })

  it('displays zero when no expenses', () => {
    mockUseDayTotal.mockReturnValue({
      data: 0,
      isLoading: false,
    })

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('฿0.00')).toBeInTheDocument()
  })

  it('handles undefined total gracefully', () => {
    mockUseDayTotal.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('฿0.00')).toBeInTheDocument()
  })

  it('handles Date object input', () => {
    mockUseDayTotal.mockReturnValue({
      data: 15000,
      isLoading: false,
    })

    const testDate = new Date('2023-12-15')
    render(<DayTotal date={testDate} />)
    
    expect(screen.getByText('Daily Total - Dec 15, 2023')).toBeInTheDocument()
    expect(screen.getByText('฿150.00')).toBeInTheDocument()
  })

  it('displays large amounts correctly', () => {
    mockUseDayTotal.mockReturnValue({
      data: 123456789, // 1,234,567.89 THB
      isLoading: false,
    })

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('฿1,234,567.89')).toBeInTheDocument()
  })
})