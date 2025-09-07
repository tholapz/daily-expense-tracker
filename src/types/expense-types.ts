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

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: string;
  tags: string[];
  notes?: string;
  receiptImageUrl?: string;
  date: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
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