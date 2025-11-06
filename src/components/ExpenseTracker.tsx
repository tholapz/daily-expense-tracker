import { useRef, useEffect, useState } from 'react';
import { DayTotal } from './DayTotal';
import { useCreateExpense, useExpensesByDate, useDeleteExpense } from '../hooks/useExpenses';
import { formatDate } from '../utils/date';

export const ExpenseTracker = () => {
  const today = new Date();
  const todayStr = formatDate(today);
  
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const { data: todayExpenses } = useExpensesByDate(today);

  const tapCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [displayTapCount, setDisplayTapCount] = useState(0);

  const executeCumulativeAdd = () => {
    if (tapCountRef.current > 0) {
      const cumulativeAmount = tapCountRef.current * 10000;
      createExpenseMutation.mutate({
        amount: cumulativeAmount,
        description: tapCountRef.current === 1 ? 'Quick expense' : `Quick expense (×${tapCountRef.current})`,
        category: 'Other',
        tags: [],
        date: todayStr,
      });
      tapCountRef.current = 0;
      setDisplayTapCount(0);
    }
  };

  const handleAddExpense = () => {
    tapCountRef.current += 1;
    setDisplayTapCount(tapCountRef.current);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for 1 second
    timeoutRef.current = setTimeout(() => {
      executeCumulativeAdd();
      timeoutRef.current = null;
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUndo = () => {
    // First priority: cancel pending cumulative add if exists
    if (tapCountRef.current > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      tapCountRef.current = 0;
      setDisplayTapCount(0);
      return;
    }

    // Second priority: delete most recent expense if exists
    if (todayExpenses && todayExpenses.length > 0) {
      // Get the most recent expense (first in array since they're sorted by newest first)
      const mostRecentExpense = todayExpenses[0];
      deleteExpenseMutation.mutate(mostRecentExpense.id);
    }
  };

  const canUndo = displayTapCount > 0 || (todayExpenses && todayExpenses.length > 0);

  const getButtonText = () => {
    if (createExpenseMutation.isPending) {
      const amount = displayTapCount * 100;
      return displayTapCount > 1 ? `Adding ฿${amount}...` : 'Adding...';
    }
    if (displayTapCount > 1) {
      const amount = displayTapCount * 100;
      return `Add ฿${amount} (${displayTapCount})`;
    }
    return 'Add ฿100';
  };

  return (
    <div className="expense-tracker">
      <DayTotal date={today} />
      
      <div className="simple-actions">
        <button
          className="btn btn-primary add-expense-btn"
          onClick={handleAddExpense}
          disabled={createExpenseMutation.isPending}
        >
          {getButtonText()}
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