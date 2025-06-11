
"use client";

import type { BetEntry } from '@/lib/types'; // BetEntry 型をインポート
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Percent, Target, CheckCircle, CornerRightUp, Award, BarChart3 } from 'lucide-react';
import { formatCurrency, formatPercentage, calculateStats } from '@/lib/calculations'; // 計算用ユーティリティをインポート
import { useMemo } from 'react';

interface DashboardCardsProps {
  entries: BetEntry[]; // stats ではなく entries を受け取るよう変更
}

const StatItem = ({ title, value, icon: Icon, unit, dataAiHint }: { title: string; value: string | number; icon: React.ElementType; unit?: string; dataAiHint?: string }) => (
  <div className="flex items-center p-4 rounded-lg border bg-background shadow-sm" data-ai-hint={dataAiHint}>
    <Icon className="h-7 w-7 text-muted-foreground mr-4 shrink-0" />
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-bold">
        {typeof value === 'number' ? (unit === 'currency' ? formatCurrency(value) : value.toLocaleString()) : value}
        {unit && unit !== 'currency' && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  </div>
);

export function DashboardCards({ entries }: DashboardCardsProps) {
  // 渡された（フィルタ済みの可能性がある）エントリーから統計値を計算
  const stats = useMemo(() => calculateStats(entries), [entries]);

  return (
    <Card data-ai-hint="summary statistics overview">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-accent" />
          統計概要
        </CardTitle>
        {/* 固定の「期間: すべて」テキストを削除 */}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatItem title="総投資額" value={stats.totalInvestment} icon={DollarSign} unit="currency" dataAiHint="money investment" />
          <StatItem title="総払戻額" value={stats.totalPayout} icon={TrendingUp} unit="currency" dataAiHint="money payout" />
          <StatItem title="純利益" value={stats.netProfit} icon={stats.netProfit >= 0 ? CheckCircle : CornerRightUp} unit="currency" dataAiHint="profit graph" />
          <StatItem title="回収率" value={formatPercentage(stats.overallRecoveryRate)} icon={Percent} dataAiHint="recovery rate" />
          <StatItem title="的中率" value={formatPercentage(stats.hitRate)} icon={Target} dataAiHint="target accuracy" />
          <StatItem title="最高払戻額" value={stats.maxPayoutPerRace} icon={Award} unit="currency" dataAiHint="award prize" />
        </div>
      </CardContent>
    </Card>
  );
}
