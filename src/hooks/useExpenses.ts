import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/expenseService';
import type { CreateExpenseInput, UpdateExpenseInput, Expense } from '../types/expense-types';
import { formatDate } from '../utils/date';

export const useExpensesByDate = (date: Date | string) => {
  const { currentUser } = useAuth();
  const dateStr = formatDate(date);

  return useQuery({
    queryKey: ['expenses', currentUser?.uid, dateStr],
    queryFn: () => expenseService.getExpensesByDate(currentUser!.uid, dateStr),
    enabled: !!currentUser,
  });
};

export const useRecentExpenses = (limit = 50) => {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['expenses', 'recent', currentUser?.uid, limit],
    queryFn: () => expenseService.getRecentExpenses(currentUser!.uid, limit),
    enabled: !!currentUser,
  });
};

export const useDayTotal = (date: Date | string) => {
  const { currentUser } = useAuth();
  const dateStr = formatDate(date);

  return useQuery({
    queryKey: ['dayTotal', currentUser?.uid, dateStr],
    queryFn: () => expenseService.getDayTotal(currentUser!.uid, dateStr),
    enabled: !!currentUser,
  });
};

export const useCreateExpense = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: CreateExpenseInput) =>
      expenseService.createExpense(currentUser!.uid, expenseData),
    onMutate: async (newExpense) => {
      const dateStr = newExpense.date;
      const expenseQueryKey = ['expenses', currentUser!.uid, dateStr];
      const dayTotalQueryKey = ['dayTotal', currentUser!.uid, dateStr];

      await queryClient.cancelQueries({ queryKey: expenseQueryKey });
      await queryClient.cancelQueries({ queryKey: dayTotalQueryKey });

      const previousExpenses = queryClient.getQueryData<Expense[]>(expenseQueryKey);
      const previousTotal = queryClient.getQueryData<number>(dayTotalQueryKey);

      const optimisticExpense: Expense = {
        ...newExpense,
        id: `temp-${Date.now()}`,
        userId: currentUser!.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Expense[]>(expenseQueryKey, (old) => [
        optimisticExpense,
        ...(old || []),
      ]);

      queryClient.setQueryData<number>(dayTotalQueryKey, 
        (previousTotal || 0) + newExpense.amount
      );

      return { previousExpenses, previousTotal, expenseQueryKey, dayTotalQueryKey };
    },
    onError: (_err, _newExpense, context) => {
      if (context) {
        queryClient.setQueryData(context.expenseQueryKey, context.previousExpenses);
        queryClient.setQueryData(context.dayTotalQueryKey, context.previousTotal);
      }
    },
    onSettled: (_data, _error, variables) => {
      const dateStr = variables.date;
      queryClient.invalidateQueries({ queryKey: ['expenses', currentUser!.uid, dateStr] });
      queryClient.invalidateQueries({ queryKey: ['dayTotal', currentUser!.uid, dateStr] });
      queryClient.invalidateQueries({ queryKey: ['expenses', 'recent', currentUser!.uid] });
    },
  });
};

export const useUpdateExpense = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: UpdateExpenseInput) =>
      expenseService.updateExpense(currentUser!.uid, expenseData),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dayTotal'] });
    },
  });
};

export const useDeleteExpense = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) =>
      expenseService.deleteExpense(currentUser!.uid, expenseId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dayTotal'] });
    },
  });
};