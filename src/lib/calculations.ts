
import type { BetEntry, DashboardStats, ChartDataPoint, ProfitChartTimespan } from './types';
import { format, parseISO, getWeek, getYear, addDays } from 'date-fns';

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
  
  // 最初のエントリー以前の累積利益を算出
  // これにより、過去にエントリーがあった場合もグラフの起点がずれない
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
    } else if (currentDate >= parseISO(firstDateStr)) { // 初回以降の日は前日の利益を引き継ぐ
        // エントリーのない日は直前の利益を流用
        allDailyProfits[dateKey] = lastKnownProfit;
    } else {
        // エントリー前の日は初期基準値を使用
        allDailyProfits[dateKey] = initialBaselineProfit;
    }
     if (dailyCumulativeProfitsWithEntries[dateKey] !== undefined) {
      allDailyProfits[dateKey] = dailyCumulativeProfitsWithEntries[dateKey]; // 実際のエントリー日の値を優先
    } else {
      allDailyProfits[dateKey] = lastKnownProfit; // エントリーがない日は直前値を使用
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
              // 週次・月次の場合はその期間の終了時点の累積利益を使用する
              // そのためここでは最新の値を採用している
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
