
export interface BetEntry {
  id: string;
  date: string; // ISO string format: "YYYY-MM-DD"
  raceName?: string;
  betAmount: number;
  payoutAmount: number;
  profitLoss: number; // Calculated: payoutAmount - betAmount
  roi: number; // Calculated: (payoutAmount / betAmount) * 100. Represents Payout Rate (回収率). Handles betAmount = 0.
}

export interface DashboardStats {
  totalInvestment: number;
  totalPayout: number;
  netProfit: number;
  overallRoi: number; // Overall Payout Rate (回収率): (totalPayout / totalInvestment) * 100
  hitRate: number; // Percentage
  maxPayoutPerRace: number; // New: Highest payout in a single race
}

export interface ChartDataPoint {
  name: string; // Date, week, or month label
  value: number; // Profit/loss or Recovery Rate
}

export type ProfitChartTimespan = "daily" | "weekly" | "monthly";

