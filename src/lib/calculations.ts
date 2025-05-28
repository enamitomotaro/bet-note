
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
    if (entry.payoutAmount > entry.betAmount) { // Winning condition: payout is greater than bet
      winningEntryCount++;
    }
    if (entry.payoutAmount > maxPayoutPerRace) {
      maxPayoutPerRace = entry.payoutAmount;
    }
  });

  const netProfit = totalPayout - totalInvestment;
  // overallRecoveryRate は (総払戻額 / 総投資額) * 100
  const overallRecoveryRate = totalInvestment > 0 ? (totalPayout / totalInvestment) * 100 : 0;
  const hitRate = entries.length > 0 ? (winningEntryCount / entries.length) * 100 : 0;

  return {
    totalInvestment,
    totalPayout,
    netProfit,
    overallRecoveryRate, // This is overallRecoveryRate, not overallRoi
    hitRate,
    maxPayoutPerRace,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export function formatPercentage(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00%';
  }
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

  for (const entry of sortedEntries) {
    cumulativeProfit += entry.profitLoss;
    const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
    dailyCumulativeProfitsWithEntries[dateKey] = cumulativeProfit;
  }

  if (Object.keys(dailyCumulativeProfitsWithEntries).length === 0) {
    return []; 
  }
  
  const firstDateStr = Object.keys(dailyCumulativeProfitsWithEntries).sort()[0];
  const lastDateStr = sortedEntries.length > 0 ? format(parseISO(sortedEntries[sortedEntries.length -1].date), 'yyyy-MM-dd') : firstDateStr;
  
  let currentDate = parseISO(firstDateStr);
  const lastDate = parseISO(lastDateStr);
  let lastKnownProfit = 0;
  
  // Calculate profit before the very first date in dailyCumulativeProfitsWithEntries
  // This ensures the graph starts from a sensible baseline if there were entries before this period.
  let initialBaselineProfit = 0;
    for (const entry of sortedEntries) {
        if (parseISO(entry.date) < parseISO(firstDateStr)) {
            initialBaselineProfit += entry.profitLoss;
        } else {
            break; 
        }
    }
  lastKnownProfit = initialBaselineProfit;

  
  const allDailyProfits: Record<string, number> = {};
  while (currentDate <= lastDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    if (dailyCumulativeProfitsWithEntries[dateKey] !== undefined) {
      lastKnownProfit = dailyCumulativeProfitsWithEntries[dateKey];
    } else if (currentDate >= parseISO(firstDateStr)) { // Only fill forward if we are past or at the first entry date
        // For days without entries, carry forward the last known profit
        allDailyProfits[dateKey] = lastKnownProfit;
    } else {
        // For days before any recorded entry with profit, use the initial baseline
        allDailyProfits[dateKey] = initialBaselineProfit;
    }
     if (dailyCumulativeProfitsWithEntries[dateKey] !== undefined) {
      allDailyProfits[dateKey] = dailyCumulativeProfitsWithEntries[dateKey]; // Prioritize actual entry day's cumulative
    } else {
      allDailyProfits[dateKey] = lastKnownProfit; // Fill with last known if no entry on this day
    }
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
              // For weekly/monthly, we want the cumulative profit at the END of that period.
              // So, this assignment effectively takes the latest known profit for that period.
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
  // 回収率 = (総払戻額 / 総投資額) * 100
  return (totalPayout / totalInvestment) * 100;
}
