export interface BetEntry {
  id: string;
  date: string; // ISO string format: "YYYY-MM-DD"
  raceName?: string;
  betAmount: number;
  payoutAmount: number;
  profitLoss: number; // Calculated: payoutAmount - betAmount
  roi: number; // Calculated: (profitLoss / betAmount) * 100, handle betAmount = 0
}

export interface DashboardStats {
  totalInvestment: number;
  totalPayout: number;
  netProfit: number;
  overallRoi: number;
  hitRate: number; // Percentage
  winningStreak: number;
}

export interface ChartDataPoint {
  name: string; // Date, week, or month label
  value: number; // Profit/loss or ROI
}

export type ProfitChartTimespan = "daily" | "weekly" | "monthly";
