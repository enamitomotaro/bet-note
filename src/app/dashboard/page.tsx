
"use client";

import { DashboardCards } from '@/components/DashboardCards';
import { ProfitChart } from '@/components/ProfitChart';
import { EntriesTable } from '@/components/EntriesTable';
import { useBetEntries } from '@/hooks/useBetEntries';
import { useEffect, useState, useMemo } from 'react';
import type { BetEntry } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Settings, ArrowUp, ArrowDown, ListFilter, FilterX, CalendarDays, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import useLocalStorage from '@/hooks/useLocalStorage';
import type { ComponentType } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

type CardId = 'stats' | 'chart' | 'table';

const CARD_ORDER_KEY = 'dashboardCardOrder_v2';

const cardDisplayNames: Record<CardId, string> = {
  stats: "統計概要",
  chart: "損益グラフ",
  table: "エントリー履歴",
};

interface CardComponentProps {
  entries: BetEntry[];
  onDeleteEntry?: (id: string) => void;
  onUpdateEntry?: (id: string, data: any) => void;
  displayLimit?: number;
  viewAllLinkPath?: string;
  showFilterControls?: boolean;
}

export default function DashboardPage() {
  const { entries: allEntries, deleteEntry, updateEntry, isLoaded } = useBetEntries();
  const [clientMounted, setClientMounted] = useState(false);

  // Actual states for dashboard display and local storage
  const [cardOrder, setCardOrder] = useLocalStorage<CardId[]>(
    CARD_ORDER_KEY,
    ['stats', 'chart', 'table']
  );
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Temporary states for dialog editing
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [tempCardOrder, setTempCardOrder] = useState<CardId[]>(cardOrder);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);


  useEffect(() => {
    setClientMounted(true);
  }, []);

  // Initialize temporary states when dialog opens
  useEffect(() => {
    if (isSettingsDialogOpen) {
      setTempCardOrder([...cardOrder]);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isSettingsDialogOpen, cardOrder, startDate, endDate]);


  const filteredEntries = useMemo(() => {
    if (!isLoaded || !clientMounted) return [];
    let tempEntries = [...allEntries];
    if (startDate) {
      const filterStart = startOfDay(startDate);
      tempEntries = tempEntries.filter(entry => {
        const entryDate = startOfDay(parseISO(entry.date));
        return entryDate >= filterStart;
      });
    }
    if (endDate) {
      const filterEnd = startOfDay(endDate);
      tempEntries = tempEntries.filter(entry => {
        const entryDate = startOfDay(parseISO(entry.date));
        return entryDate <= filterEnd;
      });
    }
    return tempEntries;
  }, [allEntries, startDate, endDate, isLoaded, clientMounted]);

  const moveCardInDialog = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...tempCardOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setTempCardOrder(newOrder);
  };

  const clearFiltersInDialog = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
  };

  const handleSaveChanges = () => {
    setCardOrder(tempCardOrder);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsSettingsDialogOpen(false);
  };

  const isTempFilterActive = tempStartDate || tempEndDate;


  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }

  const componentsToRender = {
    stats: { component: DashboardCards, props: { entries: filteredEntries } },
    chart: { component: ProfitChart, props: { entries: filteredEntries } },
    table: {
      component: EntriesTable,
      props: {
        entries: filteredEntries,
        onDeleteEntry: deleteEntry,
        onUpdateEntry: updateEntry,
        displayLimit: 5,
        viewAllLinkPath: "/dashboard/entries",
        showFilterControls: false
      }
    },
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsDialogOpen(true)}
          data-ai-hint="layout settings gears"
          aria-label="レイアウト・フィルター設定"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-8">
        {cardOrder.map((cardId) => {
          const CardComponent = componentsToRender[cardId].component as ComponentType<any>;
          const props = componentsToRender[cardId].props;
          return (
            <div key={cardId}>
              <CardComponent {...props} />
            </div>
          );
        })}
      </div>

      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>レイアウト・フィルター設定</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">期間フィルター</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {tempStartDate ? format(tempStartDate, "PPP") : <span>開始日</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempStartDate}
                      onSelect={setTempStartDate}
                      initialFocus
                      disabled={(date) => tempEndDate ? date > tempEndDate : false}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                       className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {tempEndDate ? format(tempEndDate, "PPP") : <span>終了日</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={setTempEndDate}
                      initialFocus
                      disabled={(date) => tempStartDate ? date < tempStartDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {isTempFilterActive && (
                <Button
                  variant="ghost"
                  onClick={clearFiltersInDialog}
                  className="w-full text-accent hover:bg-accent/10"
                  data-ai-hint="clear filter cross"
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  フィルターを解除
                </Button>
              )}
            </div>

            <div>
                <h3 className="text-lg font-medium mb-3 border-t pt-4">カードの表示順</h3>
                <div className="space-y-2">
                {tempCardOrder.map((cardId, index) => (
                <div key={cardId} className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <span className="font-medium">{cardDisplayNames[cardId]}</span>
                    <div className="space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveCardInDialog(index, 'up')}
                        disabled={index === 0}
                        aria-label={`${cardDisplayNames[cardId]}を上に移動`}
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveCardInDialog(index, 'down')}
                        disabled={index === tempCardOrder.length - 1}
                        aria-label={`${cardDisplayNames[cardId]}を下に移動`}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                ))}
              </div>
            </div>
          </div>
           <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                閉じる
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Save className="mr-2 h-4 w-4" />
              保存する
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
