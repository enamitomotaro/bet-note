
import type { BetEntry, DashboardStats, ChartDataPoint, ProfitChartTimespan } from './types';
import { format, parseISO, startOfWeek, startOfMonth, getWeek, getMonth, getYear, addDays } from 'date-fns';

export function calculateStats(entries: BetEntry[]): DashboardStats {
  let totalInvestment = 0;
  let totalPayout = 0;
  let winningEntryCount = 0;
  let maxPayoutPerRace = 0;

  entries.forEach(entry => {
    totalInvestment += entry.betAmount;
    totalPayout += entry.payoutAmount;
    if (entry.profitLoss > 0) {
      winningEntryCount++;
    }
    if (entry.payoutAmount > maxPayoutPerRace) {
      maxPayoutPerRace = entry.payoutAmount;
    }
  });

  const netProfit = totalPayout - totalInvestment;
  const overallRecoveryRate = totalInvestment > 0 ? (totalPayout / totalInvestment) * 100 : 0;
  const hitRate = entries.length > 0 ? (winningEntryCount / entries.length) * 100 : 0;

  return {
    totalInvestment,
    totalPayout,
    netProfit,
    overallRecoveryRate,
    hitRate,
    maxPayoutPerRace,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function prepareProfitChartData(entries: BetEntry[], timespan: ProfitChartTimespan): ChartDataPoint[] {
  if (!entries.length) return [];

  const sortedEntries = [...entries].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  const aggregatedData: Record<string, number> = {};

  sortedEntries.forEach(entry => {
    const date = parseISO(entry.date);
    let key: string;

    switch (timespan) {
      case 'daily':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'weekly':
        key = `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
        break;
      case 'monthly':
        key = format(date, 'yyyy-MM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }

    if (!aggregatedData[key]) {
      aggregatedData[key] = 0;
    }
    aggregatedData[key] += entry.profitLoss;
  });
  
  return Object.entries(aggregatedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => a.name.localeCompare(b.name));
}

export function prepareCumulativeProfitChartData(entries: BetEntry[], timespan: ProfitChartTimespan): ChartDataPoint[] {
  if (!entries.length) return [];

  const sortedEntries = [...entries].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  let cumulativeProfit = 0;
  const dailyCumulativeProfitsWithEntries: Record<string, number> = {};

  // Calculate cumulative profits only for days with entries
  for (const entry of sortedEntries) {
    cumulativeProfit += entry.profitLoss;
    const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
    dailyCumulativeProfitsWithEntries[dateKey] = cumulativeProfit;
  }

  if (Object.keys(dailyCumulativeProfitsWithEntries).length === 0) {
    return []; // No entries, no cumulative data
  }

  // Fill missing days with the previous day's cumulative profit
  const firstDateStr = Object.keys(dailyCumulativeProfitsWithEntries).sort()[0];
  const lastDateStr = sortedEntries.length > 0 ? format(parseISO(sortedEntries[sortedEntries.length -1].date), 'yyyy-MM-dd') : firstDateStr;
  
  let currentDate = parseISO(firstDateStr);
  const lastDate = parseISO(lastDateStr);
  let lastKnownProfit = 0;
  
  // Find initial profit for the very first day if it's before the first entry (should be 0 or based on entries before firstDateStr if any)
  // To ensure the graph starts from a sensible point, check if the first entry date is the firstDateStr
  // If not, it means there might be entries before that date.
  // However, with sortedEntries, firstDateStr should be the date of the first entry.
  // Let's find the profit *before* the first entry to correctly establish the baseline.
  // This is tricky, a simpler approach is to ensure the first point reflects the first entry's impact.
  // The loop below starts from firstDateStr.
  
  const allDailyProfits: Record<string, number> = {};
  let tempCumulativeProfitBeforeFirstDate = 0;
  for (const entry of sortedEntries) {
      if (parseISO(entry.date) < parseISO(firstDateStr)) {
          tempCumulativeProfitBeforeFirstDate += entry.profitLoss;
      } else {
          break;
      }
  }
  lastKnownProfit = tempCumulativeProfitBeforeFirstDate;


  while (currentDate <= lastDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    if (dailyCumulativeProfitsWithEntries[dateKey] !== undefined) {
      lastKnownProfit = dailyCumulativeProfitsWithEntries[dateKey];
    }
    allDailyProfits[dateKey] = lastKnownProfit;
    currentDate = addDays(currentDate, 1);
  }
  
  const aggregatedData: Record<string, number> = {};
  Object.entries(allDailyProfits).forEach(([dateStr, profit]) => {
      const date = parseISO(dateStr);
      let key: string;
      switch (timespan) {
          case 'daily':
              key = dateStr;
              aggregatedData[key] = profit;
              break;
          case 'weekly':
              key = `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
              aggregatedData[key] = profit; 
              break;
          case 'monthly':
              key = format(date, 'yyyy-MM');
              aggregatedData[key] = profit;
              break;
      }
  });

  return Object.entries(aggregatedData)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => a.name.localeCompare(b.name));
}


export function calculateAverageRecoveryRate(entries: BetEntry[]): number {
  if (entries.length === 0) return 0;
  const totalInvestment = entries.reduce((sum, entry) => sum + entry.betAmount, 0);
  const totalPayout = entries.reduce((sum, entry) => sum + entry.payoutAmount, 0);
  if (totalInvestment === 0) return 0;
  return (totalPayout / totalInvestment) * 100;
}
