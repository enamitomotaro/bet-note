
import type { BetEntry, DashboardStats, ChartDataPoint, ProfitChartTimespan } from './types';
import { format, parseISO, getWeek, getYear, eachDayOfInterval } from 'date-fns';

export function calculateStats(entries: BetEntry[]): DashboardStats {
  let totalInvestment = 0;
  let totalPayout = 0;
  let winningEntryCount = 0;
  let maxPayoutPerRace = 0;

  entries.forEach(entry => {
    totalInvestment += entry.betAmount;
    totalPayout += entry.payoutAmount;
    if (entry.payoutAmount > entry.betAmount) { // 払戻金が掛け金を上回れば的中
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
    overallRecoveryRate, // overallRecoveryRate（総回収率）を返す
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
  const profitMap = new Map<string, number>();
  for (const entry of sortedEntries) {
    cumulativeProfit += entry.profitLoss;
    const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
    profitMap.set(dateKey, cumulativeProfit);
  }

  const firstDate = parseISO(sortedEntries[0].date);
  const lastDate = parseISO(sortedEntries[sortedEntries.length - 1].date);

  const aggregatedData: Record<string, number> = {};
  let lastKnownProfit = 0;

  for (const date of eachDayOfInterval({ start: firstDate, end: lastDate })) {
    const dateKey = format(date, 'yyyy-MM-dd');
    if (profitMap.has(dateKey)) {
      lastKnownProfit = profitMap.get(dateKey)!;
    }

    let key: string;
    switch (timespan) {
      case 'daily':
        key = dateKey;
        break;
      case 'weekly':
        key = `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
        break;
      case 'monthly':
        key = format(date, 'yyyy-MM');
        break;
    }
    aggregatedData[key] = lastKnownProfit;
  }

  return Object.entries(aggregatedData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}


export function calculateAverageRecoveryRate(entries: BetEntry[]): number {
  if (entries.length === 0) return 0;
  const totalInvestment = entries.reduce((sum, entry) => sum + entry.betAmount, 0);
  const totalPayout = entries.reduce((sum, entry) => sum + entry.payoutAmount, 0);
  if (totalInvestment === 0) return 0;
  // 回収率 = (総払戻額 / 総投資額) * 100
  return (totalPayout / totalInvestment) * 100;
}
