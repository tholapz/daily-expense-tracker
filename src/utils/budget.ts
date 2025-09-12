/**
 * Gets the daily budget from environment variables
 * @returns Daily budget in cents (multiply by 100 for storage)
 */
export const getDailyBudget = (): number => {
  const budgetEnv = import.meta.env.DAILY_BUDGET;
  const defaultBudget = 2000; // ฿2000 default
  
  if (!budgetEnv) {
    return defaultBudget * 100; // Convert to cents
  }
  
  const parsedBudget = parseFloat(budgetEnv);
  if (isNaN(parsedBudget) || parsedBudget <= 0) {
    console.warn(`Invalid DAILY_BUDGET value: "${budgetEnv}". Using default: ฿${defaultBudget}`);
    return defaultBudget * 100;
  }
  
  return parsedBudget * 100; // Convert THB to cents
};

/**
 * Gets the daily budget in THB (for display purposes)
 * @returns Daily budget in THB
 */
export const getDailyBudgetTHB = (): number => {
  return getDailyBudget() / 100;
};

/**
 * Formats the daily budget for display
 * @returns Formatted budget string (e.g., "฿2,000")
 */
export const formatDailyBudget = (): string => {
  const budget = getDailyBudgetTHB();
  return `฿${budget.toLocaleString()}`;
};