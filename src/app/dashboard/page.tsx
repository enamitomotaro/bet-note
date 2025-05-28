
"use client";

import { DashboardCards } from '@/components/DashboardCards';
import { ProfitChart } from '@/components/ProfitChart';
import { useBetEntries } from '@/hooks/useBetEntries';
import { calculateStats } from '@/lib/calculations';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useMemo } from 'react';
import type { DashboardStats, BetEntry } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterX, ListFilter } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { entries, isLoaded } = useBetEntries();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(calculateStats([]));
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredEntries = useMemo(() => {
    if (!clientMounted || !isLoaded) return [];
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      if (!isValid(entryDate)) return false;
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  }, [entries, startDate, endDate, clientMounted, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setDashboardStats(calculateStats(filteredEntries));
    }
  }, [filteredEntries, isLoaded]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-8" data-ai-hint="calendar filter">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-accent" />
            期間フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full md:w-auto justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>開始日</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full md:w-auto justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>終了日</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button variant="ghost" onClick={clearFilters} className="w-full md:w-auto text-accent hover:text-accent/90">
                <FilterX className="mr-2 h-4 w-4" />
                フィルター解除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DashboardCards stats={dashboardStats} />
      <Separator className="my-8" />
      <div className="grid grid-cols-1 gap-8">
        <ProfitChart entries={filteredEntries} />
      </div>
    </>
  );
}
