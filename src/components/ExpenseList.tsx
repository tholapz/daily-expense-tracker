import { useState } from 'react';
import { useExpensesByDate, useDeleteExpense } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currency';
import { formatDateForDisplay } from '../utils/date';
import type { Expense } from '../types/expense-types';

interface ExpenseListProps {
  date: Date | string;
}

export const ExpenseList = ({ date }: ExpenseListProps) => {
  const { data: expenses, isLoading, error } = useExpensesByDate(date);
  const deleteExpenseMutation = useDeleteExpense();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setDeletingId(expenseId);
      try {
        await deleteExpenseMutation.mutateAsync(expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading expenses...</div>;
  }

  if (error) {
    return <div className="loading">Error loading expenses</div>;
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="empty-state">
          <h3>No expenses yet</h3>
          <p>Add your first expense above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>
        Expenses for {formatDateForDisplay(date)}
      </h3>
      
      {expenses.map((expense: Expense) => (
        <div key={expense.id} className="expense-item">
          <div className="expense-details">
            <h4 className="expense-description">{expense.description}</h4>
            <div className="expense-meta">
              <span className="category-tag">{expense.category}</span>
              {expense.tags.length > 0 && (
                <div className="tags">
                  {expense.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              {expense.notes && <span>📝 {expense.notes}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div className="expense-amount">
              {formatCurrency(expense.amount)}
            </div>
            <div className="expense-actions">
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {deletingId === expense.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};