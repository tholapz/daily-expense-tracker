import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ViewRouter } from './components/ViewRouter';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ViewRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
