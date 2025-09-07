import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateKey = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyyMMdd');
};

export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

export const getDateRanges = (date: Date = new Date()) => {
  return {
    day: {
      start: startOfDay(date),
      end: endOfDay(date),
    },
    week: {
      start: startOfWeek(date),
      end: endOfWeek(date),
    },
    month: {
      start: startOfMonth(date),
      end: endOfMonth(date),
    },
    year: {
      start: startOfYear(date),
      end: endOfYear(date),
    },
  };
};