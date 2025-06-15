export interface BetEntry {
  id: string;
  date: string; // ISO 形式 "YYYY-MM-DD"
  raceName?: string;
  betAmount: number;
  payoutAmount: number | null;
  profitLoss: number; // 払戻金 - 掛け金 で計算
  roi: number; // (payoutAmount / betAmount) * 100 で計算した回収率。betAmount が 0 の場合も考慮
}

export interface DashboardStats {
  totalInvestment: number;
  totalPayout: number;
  netProfit: number;
  overallRecoveryRate: number; // 総回収率: (総払戻額 / 総投資額) * 100
  hitRate: number; // 的中率（%）
  maxPayoutPerRace: number; // 1レースでの最高払戻額
}

export interface ChartDataPoint {
  name: string; // 日付・週・月のラベル
  value: number; // 損益または回収率
}

export type ProfitChartTimespan = "daily" | "weekly" | "monthly";
