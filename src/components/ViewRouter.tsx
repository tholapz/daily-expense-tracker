import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isMobileDevice } from '../utils/deviceDetection';
import { LoginView } from './LoginView';
import { ExpenseTracker } from './ExpenseTracker';
import { HeatmapView } from './HeatmapView';

type ViewType = 'expenses' | 'heatmap';

export const ViewRouter = () => {
  const { currentUser, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('expenses');

  useEffect(() => {
    if (currentUser) {
      // Get saved view preference from localStorage
      const savedView = localStorage.getItem('preferredView') as ViewType;
      
      if (savedView) {
        setCurrentView(savedView);
      } else {
        // Default view based on device type
        const defaultView = isMobileDevice() ? 'expenses' : 'heatmap';
        setCurrentView(defaultView);
        localStorage.setItem('preferredView', defaultView);
      }
    }
  }, [currentUser]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem('preferredView', view);
  };

  // Show login view if not authenticated
  if (!currentUser) {
    return <LoginView />;
  }

  // Show authenticated views with switcher
  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Welcome, {currentUser.displayName || currentUser.email}</h1>
          <div className="auth-section">
            <div className="view-toggle">
              <input 
                type="radio" 
                id="expenses-view" 
                name="view" 
                checked={currentView === 'expenses'}
                onChange={() => handleViewChange('expenses')}
              />
              <label htmlFor="expenses-view" className="view-toggle-option">
                Expenses
              </label>
              
              <input 
                type="radio" 
                id="heatmap-view" 
                name="view" 
                checked={currentView === 'heatmap'}
                onChange={() => handleViewChange('heatmap')}
              />
              <label htmlFor="heatmap-view" className="view-toggle-option">
                Heatmap
              </label>
              
              <div className="view-toggle-slider">
                <div className="view-toggle-indicator"></div>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>

        {currentView === 'expenses' ? <ExpenseTracker /> : <HeatmapView />}
      </div>
    </div>
  );
};