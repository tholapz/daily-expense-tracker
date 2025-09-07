export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  notes?: string;
  receiptImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  date: string;
}

export interface DayExpenses {
  id: string;
  date: string;
  expenses: Expense[];
  totalAmount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
}

export interface ExpenseStats {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: string };