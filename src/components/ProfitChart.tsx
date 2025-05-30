
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BetEntry, ProfitChartTimespan } from '@/lib/types';
import { prepareProfitChartData, prepareCumulativeProfitChartData, formatCurrency } from '@/lib/calculations';
import { TrendingUp, LineChart, CalendarDays } from 'lucide-react'; // Added CalendarDays

interface ProfitChartProps {
  entries: BetEntry[];
}

type ChartType = "period" | "cumulative";

const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (active && payload && payload.length) {
    const dataName = chartType === "period" ? "期間別損益" : "累積損益";
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-md border border-border shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        <p className="intro text-sm text-accent">{`${dataName} : ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};


export function ProfitChart({ entries }: ProfitChartProps) {
  const [timespan, setTimespan] = useState<ProfitChartTimespan>("daily");
  const [chartType, setChartType] = useState<ChartType>("period");
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!clientMounted) return [];
    if (chartType === "period") {
      return prepareProfitChartData(entries, timespan);
    }
    return prepareCumulativeProfitChartData(entries, timespan);
  }, [entries, timespan, chartType, clientMounted]);

  const chartTitle = useMemo(() => {
    return chartType === "period" ? "期間別損益グラフ" : "累積損益グラフ";
  }, [chartType]);

  const chartIcon = useMemo(() => {
    return chartType === "period" ? TrendingUp : LineChart;
  }, [chartType]);

  if (!clientMounted) {
    return (
        <Card className="flex flex-col" data-ai-hint="graph finance">
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            {chartTitle}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            {React.createElement(chartIcon, { className: "h-6 w-6 text-accent" })}
            {chartTitle}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as ChartType)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="period" className="text-xs px-3 py-1.5">期間別</TabsTrigger>
                <TabsTrigger value="cumulative" className="text-xs px-3 py-1.5">累積</TabsTrigger>
                </TabsList>
            </Tabs>
            <Tabs value={timespan} onValueChange={(value) => setTimespan(value as ProfitChartTimespan)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="daily" className="text-xs px-3 py-1.5">日次</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs px-3 py-1.5">週次</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-3 py-1.5">月次</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="text-sm text-muted-foreground flex items-center ml-0 sm:ml-2 mt-2 sm:mt-0">
              <CalendarDays className="mr-1 h-4 w-4" />
              <span>期間: すべて</span>
            </div>
          </div>
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
              <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}/>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--accent))" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
                strokeWidth={2} 
                name={chartType === "period" ? "期間別損益" : "累積損益"}
              />
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
