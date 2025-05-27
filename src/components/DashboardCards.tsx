"use client";

import type { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Percent, Target, CheckCircle, CornerRightUp } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/calculations';

interface DashboardCardsProps {
  stats: DashboardStats;
}

const StatCard = ({ title, value, icon: Icon, unit, dataAiHint }: { title: string; value: string | number; icon: React.ElementType; unit?: string, dataAiHint?: string }) => (
  <Card data-ai-hint={dataAiHint}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {typeof value === 'number' ? (unit === 'currency' ? formatCurrency(value) : value.toLocaleString()) : value}
        {unit && unit !== 'currency' && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </div>
    </CardContent>
  </Card>
);

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      <StatCard title="総投資額" value={stats.totalInvestment} icon={DollarSign} unit="currency" dataAiHint="money investment" />
      <StatCard title="総払戻額" value={stats.totalPayout} icon={TrendingUp} unit="currency" dataAiHint="money payout" />
      <StatCard title="純利益" value={stats.netProfit} icon={stats.netProfit >= 0 ? CheckCircle : CornerRightUp} unit="currency" dataAiHint="profit graph" />
      <StatCard title="ROI" value={formatPercentage(stats.overallRoi)} icon={Percent} dataAiHint="return investment" />
      <StatCard title="的中率" value={formatPercentage(stats.hitRate)} icon={Target} dataAiHint="target accuracy" />
      <StatCard title="連勝数" value={stats.winningStreak} icon={CornerRightUp} unit="回" dataAiHint="trophy win" />
    </div>
  );
}
