import type { BetEntry, DashboardStats, ChartDataPoint, ProfitChartTimespan } from './types';
import { format, parseISO, startOfWeek, startOfMonth, getWeek, getMonth, getYear } from 'date-fns';

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
  const overallRoi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const hitRate = entries.length > 0 ? (winningEntryCount / entries.length) * 100 : 0;

  return {
    totalInvestment,
    totalPayout,
    netProfit,
    overallRoi,
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
        // Group by year and week number to handle multi-year data
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
    .sort((a,b) => a.name.localeCompare(b.name)); // Ensure chronological order for chart
}

export function prepareRoiChartData(entries: BetEntry[]): ChartDataPoint[] {
   if (!entries.length) return [];
   // For ROI bar chart, perhaps show ROI per race or average ROI over time periods.
   // Here, let's show ROI for each entry with a race name, or just by date.
   return entries.map(entry => ({
     name: entry.raceName || entry.date,
     value: entry.roi,
   })).slice(-10); // Show last 10 for brevity, can be made configurable
}

export function calculateAverageRoi(entries: BetEntry[]): number {
  if (entries.length === 0) return 0;
  const totalInvestment = entries.reduce((sum, entry) => sum + entry.betAmount, 0);
  const totalProfitLoss = entries.reduce((sum, entry) => sum + entry.profitLoss, 0);
  if (totalInvestment === 0) return 0;
  return (totalProfitLoss / totalInvestment) * 100;
}
