import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm = ({ onToggleMode }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !displayName) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password, displayName);
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'Failed to create account. Please try again';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '500' }}>
        Create Account
      </h2>
      
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="displayName">Full Name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password (min 6 characters)"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', color: '#525252' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: '#0a0a0a',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontFamily: 'Geist Mono, monospace'
          }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
};