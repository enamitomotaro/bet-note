
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <Accordion type="single" collapsible className="w-full mb-8" data-ai-hint="filter accordion">
        <AccordionItem value="date-filter">
          <div 
            className={cn(
              "px-4 py-3 bg-card border rounded-lg data-[state=open]:rounded-b-none flex justify-between items-center",
              (startDate || endDate) && "border-accent" // Apply accent border if filters are active
            )}
          >
            <AccordionTrigger
              className={cn(
                "text-base hover:no-underline flex-grow flex items-center gap-2 p-0",
                // Remove default AccordionTrigger padding as it's handled by the parent div
                // Also remove default justify-between as we handle it with flex-grow and the sibling button
              )}
            >
              <ListFilter className="h-5 w-5 text-accent" />
              <span className="text-foreground">期間フィルター</span>
            </AccordionTrigger>
            {(startDate || endDate) && (
              <Button 
                variant="ghost" 
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent accordion from toggling
                  clearFilters(); 
                }} 
                className="text-accent hover:text-accent/90 h-auto p-1 ml-2 shrink-0" // Added shrink-0
              >
                <FilterX className="mr-1 h-4 w-4" />
                解除
              </Button>
            )}
          </div>
          <AccordionContent className="bg-card border border-t-0 rounded-b-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
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
                  <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>終了日</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DashboardCards stats={dashboardStats} />
      <Separator className="my-8" />
      <div className="grid grid-cols-1 gap-8">
        <ProfitChart entries={filteredEntries} />
      </div>
    </>
  );
}
