"use client";

import { useMemo, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BetEntry, ChartDataPoint } from '@/lib/types';
import { prepareRoiChartData, formatPercentage } from '@/lib/calculations';
import { Percent } from 'lucide-react';

interface RoiChartProps {
  entries: BetEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-md border border-border shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        <p className="intro text-sm text-primary">{`ROI : ${formatPercentage(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

export function RoiChart({ entries }: RoiChartProps) {
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);
  
  const chartData = useMemo(() => {
    if (!clientMounted) return [];
    // Display ROI for the last 10 entries with race names, or just last 10 entries
    const relevantEntries = entries.filter(e => e.betAmount > 0).slice(-10);
    return relevantEntries.map(entry => ({
     name: entry.raceName || format(new Date(entry.date), "MM/dd"),
     value: entry.roi,
   }));
  }, [entries, clientMounted]);

  if (!clientMounted) {
    return (
        <Card data-ai-hint="bar chart finance">
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
            <Percent className="h-6 w-6 text-accent" />
            ROIグラフ (直近最大10件)
            </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
            <p>読み込み中...</p>
        </CardContent>
        </Card>
    );
  }

  return (
    <Card data-ai-hint="bar chart finance">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Percent className="h-6 w-6 text-accent" />
          ROIグラフ (直近最大10件)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] pt-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${formatPercentage(value)}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="ROI" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">表示するデータがありません。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
