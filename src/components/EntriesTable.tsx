
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { BetEntry } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CalendarIcon, ListFilter, Trash2, FilterX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateAverageRecoveryRate, formatCurrency, formatPercentage } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
}

export function EntriesTable({ entries, onDeleteEntry }: EntriesTableProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);
  
  const filteredEntries = useMemo(() => {
    if (!clientMounted) return []; // Return empty array or initial entries if not mounted
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      if (!isValid(entryDate)) return false;
      const start = startDate ? new Date(startDate.setHours(0,0,0,0)) : null;
      const end = endDate ? new Date(endDate.setHours(23,59,59,999)) : null;
      
      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  }, [entries, startDate, endDate, clientMounted]);

  const averageRecoveryRateForFiltered = useMemo(() => {
    return calculateAverageRecoveryRate(filteredEntries);
  }, [filteredEntries]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  if (!clientMounted) {
     // Or a loading skeleton for the table
    return (
        <Card data-ai-hint="table spreadsheet">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <ListFilter className="h-6 w-6 text-accent" />
                    エントリー履歴
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>読み込み中...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card data-ai-hint="table spreadsheet">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListFilter className="h-6 w-6 text-accent" />
          エントリー履歴
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
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

        { (startDate || endDate) && filteredEntries.length > 0 && (
          <Alert variant="default" className="mb-4 bg-accent/10 border-accent/50">
            <Percent className="h-4 w-4 !text-accent" />
            <AlertTitle className="text-accent">フィルター結果</AlertTitle>
            <AlertDescription>
              選択期間の平均回収率: <span className="font-semibold">{formatPercentage(averageRecoveryRateForFiltered)}</span>
            </AlertDescription>
          </Alert>
        )}

        {filteredEntries.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">表示するエントリーがありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>レース名</TableHead>
                  <TableHead className="text-right">掛け金</TableHead>
                  <TableHead className="text-right">払戻金</TableHead>
                  <TableHead className="text-right">損益</TableHead>
                  <TableHead className="text-right">回収率</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(parseISO(entry.date), "yyyy/MM/dd")}</TableCell>
                    <TableCell>{entry.raceName || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.betAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(entry.payoutAmount)}</TableCell>
                    <TableCell className={`text-right font-medium ${entry.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(entry.profitLoss)}
                    </TableCell>
                    <TableCell className="text-right">{formatPercentage(entry.roi)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => onDeleteEntry(entry.id)} aria-label="削除">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

