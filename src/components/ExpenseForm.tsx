import { useState } from 'react';
import { useCreateExpense } from '../hooks/useExpenses';
import { formatDate } from '../utils/date';
import { parseCurrency } from '../utils/currency';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Gifts',
  'Other'
];

export const ExpenseForm = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));

  const createExpenseMutation = useCreateExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !description) {
      return;
    }

    const expenseData = {
      amount: parseCurrency(amount),
      description: description.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: notes.trim() || undefined,
      date,
    };

    try {
      await createExpenseMutation.mutateAsync(expenseData);
      
      setAmount('');
      setDescription('');
      setTags('');
      setNotes('');
      setCategory('Food & Dining');
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Add New Expense</h2>
      
      <div className="form-group">
        <label htmlFor="amount">Amount (THB)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you spend on?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {DEFAULT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="lunch, work, friends"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional details..."
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={createExpenseMutation.isPending}
        style={{ width: '100%' }}
      >
        {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};