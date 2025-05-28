
"use client";

import { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BetEntry, ProfitChartTimespan } from '@/lib/types';
import { prepareProfitChartData, formatCurrency } from '@/lib/calculations';
import { TrendingUp } from 'lucide-react';

interface ProfitChartProps {
  entries: BetEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-md border border-border shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        <p className="intro text-sm text-accent">{`損益 : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};


export function ProfitChart({ entries }: ProfitChartProps) {
  const [timespan, setTimespan] = useState<ProfitChartTimespan>("daily");
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!clientMounted) return [];
    return prepareProfitChartData(entries, timespan);
  }, [entries, timespan, clientMounted]);

  if (!clientMounted) {
    return (
        <Card className="flex flex-col" data-ai-hint="graph finance">
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            損益グラフ
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 h-[400px]">
            <p>読み込み中...</p>
        </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col" data-ai-hint="graph finance">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle className="text-xl flex items-center gap-2 mb-4 md:mb-0">
            <TrendingUp className="h-6 w-6 text-accent" />
            損益グラフ
          </CardTitle>
          <Tabs defaultValue="daily" onValueChange={(value) => setTimespan(value as ProfitChartTimespan)}>
            <TabsList>
              <TabsTrigger value="daily">日次</TabsTrigger>
              <TabsTrigger value="weekly">週次</TabsTrigger>
              <TabsTrigger value="monthly">月次</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6 h-[400px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `${formatCurrency(value)}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}/>
              <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} name="損益" />
            </AreaChart>
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
