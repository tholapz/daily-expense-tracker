import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm = ({ onToggleMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'Failed to sign in. Please try again';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '500' }}>
        Sign In
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
          placeholder="Enter your password"
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p style={{ textAlign: 'center', margin: 0, fontSize: '0.875rem', color: '#525252' }}>
        Don't have an account?{' '}
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
          Sign up
        </button>
      </p>
    </form>
  );
};