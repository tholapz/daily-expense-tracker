import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types/expense-types';
import { formatDateKey } from '../utils/date';

const EXPENSES_COLLECTION = 'expenses';
const DAYS_COLLECTION = 'days';

export const expenseService = {
  async createExpense(userId: string, expenseData: CreateExpenseInput): Promise<Expense> {
    const expense: Omit<Expense, 'id'> = {
      ...expenseData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userExpensesRef = collection(firestore, 'users', userId, EXPENSES_COLLECTION);
    const docRef = await addDoc(userExpensesRef, {
      ...expense,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await this.updateDayTotal(userId, expenseData.date, expenseData.amount);

    return {
      ...expense,
      id: docRef.id,
    };
  },

  async updateExpense(userId: string, expenseData: UpdateExpenseInput): Promise<void> {
    const expenseRef = doc(firestore, 'users', userId, EXPENSES_COLLECTION, expenseData.id);
    
    await updateDoc(expenseRef, {
      ...expenseData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    const expenseRef = doc(firestore, 'users', userId, EXPENSES_COLLECTION, expenseId);
    
    const expenseDoc = await getDoc(expenseRef);
    if (expenseDoc.exists()) {
      const expense = expenseDoc.data() as Expense;
      await deleteDoc(expenseRef);
      await this.updateDayTotal(userId, expense.date, -expense.amount);
    }
  },

  async getExpensesByDate(userId: string, date: string): Promise<Expense[]> {
    const userExpensesRef = collection(firestore, 'users', userId, EXPENSES_COLLECTION);
    const q = query(
      userExpensesRef,
      where('date', '==', date),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    })) as Expense[];
  },

  async getRecentExpenses(userId: string, limitCount = 50): Promise<Expense[]> {
    const userExpensesRef = collection(firestore, 'users', userId, EXPENSES_COLLECTION);
    const q = query(
      userExpensesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    })) as Expense[];
  },

  async updateDayTotal(userId: string, date: string, amountChange: number): Promise<void> {
    const dayId = formatDateKey(date);
    const dayRef = doc(firestore, 'users', userId, DAYS_COLLECTION, dayId);
    
    const dayDoc = await getDoc(dayRef);
    
    if (dayDoc.exists()) {
      const currentTotal = dayDoc.data().totalAmount || 0;
      await updateDoc(dayRef, {
        totalAmount: currentTotal + amountChange,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(dayRef, {
        id: dayId,
        date,
        totalAmount: amountChange,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  async getDayTotal(userId: string, date: string): Promise<number> {
    const dayId = formatDateKey(date);
    const dayRef = doc(firestore, 'users', userId, DAYS_COLLECTION, dayId);
    
    const dayDoc = await getDoc(dayRef);
    return dayDoc.exists() ? dayDoc.data().totalAmount || 0 : 0;
  },

  async getExpenseDataForPeriod(userId: string, startDate: string, endDate: string): Promise<{ date: string; amount: number }[]> {
    const userDaysRef = collection(firestore, 'users', userId, DAYS_COLLECTION);
    const q = query(
      userDaysRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date,
        amount: data.totalAmount || 0,
      };
    });
  },
};