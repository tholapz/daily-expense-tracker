import { useAuth } from '../contexts/AuthContext';

export const AuthButton = () => {
  const { currentUser, signInWithGoogle, logout } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (currentUser) {
    return (
      <div className="auth-section">
        <div className="user-info">
          {currentUser.photoURL && (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="user-avatar"
            />
          )}
          <span>Welcome, {currentUser.displayName || currentUser.email}</span>
        </div>
        <button className="btn btn-secondary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-section">
      <button className="btn btn-primary" onClick={handleSignIn}>
        Sign in with Google
      </button>
    </div>
  );
};