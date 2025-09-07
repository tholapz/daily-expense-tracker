import { useState, useEffect } from 'react';
import { subDays, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/expenseService';
import { formatCurrency } from '../utils/currency';
import { getDailyBudget, formatDailyBudget } from '../utils/budget';

interface DayData {
  date: string;
  amount: number;
}

export const HeatmapView = () => {
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const { currentUser } = useAuth();

  const today = new Date();
  const startDate = subDays(today, 364); // Last 365 days (including today)
  const endDate = today;
  const days = eachDayOfInterval({ start: startDate, end: endDate }).reverse(); // Most recent first

  useEffect(() => {
    if (currentUser) {
      loadYearData();
    }
  }, [currentUser]);

  const loadYearData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      // Fetch real expense data from Firestore
      const expenseData = await expenseService.getExpenseDataForPeriod(
        currentUser.uid,
        startDateStr,
        endDateStr
      );
      
      // Round amounts to nearest ฿100 and calculate savings
      const dailyBudget = getDailyBudget(); // Get from environment variable
      let cumulativeSavings = 0;
      
      const processedData = expenseData.map(day => {
        const roundedAmount = Math.round(day.amount / 10000) * 10000; // Round to nearest ฿100
        const dailySavings = dailyBudget - day.amount;
        cumulativeSavings += dailySavings;
        
        return {
          ...day,
          amount: roundedAmount,
        };
      });
      
      setDayData(processedData);
      setTotalSavings(cumulativeSavings);
    } catch (error) {
      console.error('Error loading year data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLevel = (amount: number): string => {
    const dailyBudget = getDailyBudget();
    
    if (amount === 0) return 'empty';
    if (amount < dailyBudget * 0.25) return 'low';      // < 25% of budget
    if (amount < dailyBudget * 0.5) return 'medium';    // < 50% of budget  
    if (amount < dailyBudget) return 'high';             // < 100% of budget
    return 'very-high';                                  // >= 100% of budget (over budget)
  };

  const getDayAmount = (date: Date): number => {
    const dayEntry = dayData.find(d => 
      isSameDay(parseISO(d.date), date)
    );
    return dayEntry?.amount || 0;
  };

  const handleCellClick = (date: Date) => {
    setSelectedDate(date);
  };

  const formatSelectedDate = (date: Date) => {
    const amount = getDayAmount(date);
    return {
      date: format(date, 'MMM dd, yyyy'),
      amount: formatCurrency(amount)
    };
  };

  if (loading) {
    return (
      <div className="heatmap-view">
        <div className="loading">Loading heatmap data...</div>
      </div>
    );
  }

  return (
    <div className="heatmap-view">
      <div className="heatmap-container">
        <div className="heatmap-header">
          <div>
            <h2>Last 365 Days Expense Heatmap</h2>
            <div className="savings-summary">
              <span className={`savings-amount ${totalSavings >= 0 ? 'positive' : 'negative'}`}>
                {totalSavings >= 0 ? 'Saved: ' : 'Overspent: '}
                {formatCurrency(Math.abs(totalSavings))}
              </span>
              <span className="budget-info">Daily Budget: {formatDailyBudget()}</span>
            </div>
          </div>
        </div>

        {selectedDate && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong>{formatSelectedDate(selectedDate).date}</strong>: {formatSelectedDate(selectedDate).amount}
          </div>
        )}

        <div className="heatmap-grid">
          {days.map((day, index) => {
            const amount = getDayAmount(day);
            const intensityLevel = getIntensityLevel(amount);
            
            return (
              <div
                key={index}
                className={`heatmap-cell ${intensityLevel}`}
                onClick={() => handleCellClick(day)}
                title={`${format(day, 'MMM dd, yyyy')}: ${formatCurrency(amount)}`}
              />
            );
          })}
        </div>

        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}></div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#dcfce7' }}></div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#86efac' }}></div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#22c55e' }}></div>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#16a34a' }}></div>
          </div>
          <span>More</span>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#525252'
        }}>
          Click on any cell to see expense details for that day. 
          This visualization shows your spending patterns throughout the year.
        </div>
      </div>
    </div>
  );
};