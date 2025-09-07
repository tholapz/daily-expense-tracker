import { useDayTotal } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currency';

interface DayTotalProps {
  date: Date | string;
}

export const DayTotal = ({ date }: DayTotalProps) => {
  const { data: total, isLoading } = useDayTotal(date);

  if (isLoading) {
    return (
      <div className="day-total">
        <h2>Today's Total</h2>
        <div className="amount">Loading...</div>
      </div>
    );
  }

  return (
    <div className="day-total">
      <h2>Today's Total</h2>
      <div className="amount">
        {formatCurrency(total || 0)}
      </div>
    </div>
  );
};