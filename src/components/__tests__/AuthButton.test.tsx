import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthButton } from '../AuthButton'

// Mock the auth context
const mockUseAuth = vi.fn()
const mockSignInWithGoogle = vi.fn()
const mockLogout = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}))

describe('AuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  it('shows user info and sign out button when user is authenticated', () => {
    const mockUser = {
      uid: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: 'https://example.com/photo.jpg',
    }

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.getByAltText('John Doe')).toBeInTheDocument()
  })

  it('shows email when displayName is not available', () => {
    const mockUser = {
      uid: 'user123',
      displayName: null,
      email: 'john@example.com',
      photoURL: null,
    }

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    expect(screen.getByText('Welcome, john@example.com')).toBeInTheDocument()
  })

  it('handles sign in click', async () => {
    const user = userEvent.setup()
    mockSignInWithGoogle.mockResolvedValue({})
    
    mockUseAuth.mockReturnValue({
      currentUser: null,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    await user.click(screen.getByText('Sign in with Google'))
    
    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })

  it('handles sign out click', async () => {
    const user = userEvent.setup()
    mockLogout.mockResolvedValue({})
    
    const mockUser = {
      uid: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: null,
    }

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    await user.click(screen.getByText('Sign Out'))
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('handles sign in error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSignInWithGoogle.mockRejectedValue(new Error('Sign in failed'))
    
    mockUseAuth.mockReturnValue({
      currentUser: null,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    await user.click(screen.getByText('Sign in with Google'))
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sign in:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('handles sign out error gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogout.mockRejectedValue(new Error('Sign out failed'))
    
    const mockUser = {
      uid: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: null,
    }

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    await user.click(screen.getByText('Sign Out'))
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sign out:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('does not show avatar when photoURL is not available', () => {
    const mockUser = {
      uid: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: null,
    }

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
    })

    render(<AuthButton />)
    
    expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument()
  })
})