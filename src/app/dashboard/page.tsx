
"use client";

import { DashboardCards } from '@/components/DashboardCards';
import { ProfitChart } from '@/components/ProfitChart';
import { EntriesTable } from '@/components/EntriesTable';
import { useBetEntries } from '@/hooks/useBetEntries';
import { calculateStats } from '@/lib/calculations';
import { useEffect, useState, useMemo } from 'react';
import type { DashboardStats } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Settings, ArrowUp, ArrowDown, ListFilter, FilterX, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import useLocalStorage from '@/hooks/useLocalStorage';
import type { ComponentType } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type CardId = 'stats' | 'chart' | 'table';

const CARD_ORDER_KEY = 'dashboardCardOrder_v1';

const cardDisplayNames: Record<CardId, string> = {
  stats: "統計概要",
  chart: "損益グラフ",
  table: "エントリー履歴",
};

interface CardComponentProps {
  stats?: DashboardStats;
  entries?: any[];
  onDeleteEntry?: (id: string) => void;
  onUpdateEntry?: (id: string, data: any) => void;
  displayLimit?: number;
  viewAllLinkPath?: string;
  showFilterControls?: boolean; // For EntriesTable
}

const cardComponentsMap: Record<CardId, ComponentType<CardComponentProps>> = {
  stats: DashboardCards,
  chart: ProfitChart,
  table: EntriesTable,
};


export default function DashboardPage() {
  const { entries, deleteEntry, updateEntry, isLoaded } = useBetEntries();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(calculateStats([]));
  const [clientMounted, setClientMounted] = useState(false);

  const [cardOrder, setCardOrder] = useLocalStorage<CardId[]>(
    CARD_ORDER_KEY,
    ['stats', 'chart', 'table']
  );
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setDashboardStats(calculateStats(entries));
    }
  }, [entries, isLoaded]);

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...cardOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setCardOrder(newOrder);
  };

  if (!isLoaded || !clientMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-muted-foreground">データを読み込み中...</p>
      </div>
    );
  }
  
  const componentsToRender = {
    stats: { component: DashboardCards, props: { stats: dashboardStats } },
    chart: { component: ProfitChart, props: { entries } },
    table: { 
      component: EntriesTable, 
      props: { 
        entries, 
        onDeleteEntry: deleteEntry, 
        onUpdateEntry: updateEntry,
        displayLimit: 6,
        viewAllLinkPath: "/dashboard/entries",
        showFilterControls: false // DashboardではEntriesTableの内部フィルターUIを非表示
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
          aria-label="レイアウト設定"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Global filter removed from here */}

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
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>レイアウト設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {cardOrder.map((cardId, index) => (
              <div key={cardId} className="flex items-center justify-between p-3 border rounded-md bg-background">
                <span className="font-medium">{cardDisplayNames[cardId]}</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCard(index, 'up')}
                    disabled={index === 0}
                    aria-label={`${cardDisplayNames[cardId]}を上に移動`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCard(index, 'down')}
                    disabled={index === cardOrder.length - 1}
                    aria-label={`${cardDisplayNames[cardId]}を下に移動`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
           <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4 w-full">
              閉じる
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
