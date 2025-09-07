import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the hooks before importing the component
vi.mock('../../hooks/useExpenses', () => ({
  useDayTotal: vi.fn(),
}))

import { DayTotal } from '../DayTotal'
import { useDayTotal } from '../../hooks/useExpenses'

const mockUseDayTotal = vi.mocked(useDayTotal)

describe('DayTotal', () => {
  it('shows loading state', () => {
    mockUseDayTotal.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays total amount when loaded', () => {
    mockUseDayTotal.mockReturnValue({
      data: 25000, // 250.00 THB
      isLoading: false,
    } as any)

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('฿250.00')).toBeInTheDocument()
  })

  it('displays zero when no expenses', () => {
    mockUseDayTotal.mockReturnValue({
      data: 0,
      isLoading: false,
    } as any)

    render(<DayTotal date="2023-12-15" />)
    
    expect(screen.getByText('฿0.00')).toBeInTheDocument()
  })
})