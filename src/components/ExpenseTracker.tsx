import { DayTotal } from './DayTotal';
import { useCreateExpense, useExpensesByDate, useDeleteExpense } from '../hooks/useExpenses';
import { formatDate } from '../utils/date';

export const ExpenseTracker = () => {
  const today = new Date();
  const todayStr = formatDate(today);
  
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const { data: todayExpenses } = useExpensesByDate(today);

  const handleAddExpense = () => {
    createExpenseMutation.mutate({
      amount: 10000, // ฿100 in cents (stored as multiples of 100)
      description: 'Quick expense',
      category: 'Other',
      tags: [],
      date: todayStr,
    });
  };

  const handleUndo = () => {
    if (todayExpenses && todayExpenses.length > 0) {
      // Get the most recent expense (first in array since they're sorted by newest first)
      const mostRecentExpense = todayExpenses[0];
      deleteExpenseMutation.mutate(mostRecentExpense.id);
    }
  };

  const canUndo = todayExpenses && todayExpenses.length > 0;

  return (
    <div className="expense-tracker">
      <DayTotal date={today} />
      
      <div className="simple-actions">
        <button
          className="btn btn-primary add-expense-btn"
          onClick={handleAddExpense}
          disabled={createExpenseMutation.isPending}
        >
          {createExpenseMutation.isPending ? 'Adding...' : 'Add ฿100'}
        </button>
        
        <button
          className="btn btn-secondary undo-btn"
          onClick={handleUndo}
          disabled={!canUndo || deleteExpenseMutation.isPending}
        >
          {deleteExpenseMutation.isPending ? 'Undoing...' : 'Undo'}
        </button>
      </div>
    </div>
  );
};