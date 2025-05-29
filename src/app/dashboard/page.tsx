
"use client";

import { DashboardCards } from '@/components/DashboardCards';
import { ProfitChart } from '@/components/ProfitChart';
import { useBetEntries } from '@/hooks/useBetEntries';
import { calculateStats } from '@/lib/calculations';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useMemo } from 'react';
import type { DashboardStats } from '@/lib/types';
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

  const handleClearFiltersClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent accordion from toggling
    clearFilters();
  };


  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  const isFilterActive = startDate || endDate;

  return (
    <>
      <Accordion type="single" collapsible className="w-full mb-8" data-ai-hint="filter accordion">
        <AccordionItem
          value="date-filter"
          className={cn(
            "border-b", // Standard bottom border for accordion item
            isFilterActive ? "border-accent" : "border-border" // Border color changes if filter is active
          )}
        >
          <div className={cn("flex items-center justify-between px-4")}>
            <AccordionTrigger
              className={cn(
                "py-4 text-base hover:no-underline flex-1 flex items-center gap-2 p-0 justify-start", // Ensure trigger content is left-aligned
              )}
            >
              <ListFilter className={cn("h-5 w-5", isFilterActive ? "text-accent" : "text-muted-foreground")} />
              <span className="text-foreground">期間フィルター</span>
            </AccordionTrigger>
            {isFilterActive && (
              <Button
                variant="ghost"
                onClick={handleClearFiltersClick}
                className="text-accent hover:text-accent/90 h-auto p-1 ml-2 shrink-0"
                aria-label="フィルターを解除"
              >
                <FilterX className="mr-1 h-4 w-4" />
                解除
              </Button>
            )}
          </div>
          <AccordionContent className={cn("px-4 pt-2 pb-4")}> {/* Adjusted padding for content */}
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
