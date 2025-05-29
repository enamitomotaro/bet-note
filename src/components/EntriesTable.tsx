
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
import { CalendarIcon, ListFilter, FilterX, Pencil, Trash2, Percent, Edit3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateAverageRecoveryRate, formatCurrency, formatPercentage } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle as UiDialogTitle } from "@/components/ui/dialog";
import { EntryForm } from './EntryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as UiAlertDialogFooter, // Renamed to avoid conflict
  AlertDialogHeader,
  AlertDialogTitle as UiAlertDialogTitle, // Renamed to avoid conflict
} from "@/components/ui/alert-dialog";

interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
}

export function EntriesTable({ entries, onDeleteEntry, onUpdateEntry }: EntriesTableProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [clientMounted, setClientMounted] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BetEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterUIVisible, setIsFilterUIVisible] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredEntries = useMemo(() => {
    if (!clientMounted) return [];
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      if (!isValid(entryDate)) return false;
      const start = startDate ? new Date(startDate.setHours(0,0,0,0)) : null;
      const end = endDate ? new Date(endDate.setHours(23,59,59,999)) : null;

      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [entries, startDate, endDate, clientMounted]);

  const averageRecoveryRateForFiltered = useMemo(() => {
    return calculateAverageRecoveryRate(filteredEntries);
  }, [filteredEntries]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleEdit = (entry: BetEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  }

  const handleUpdateEntryInDialog = (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    onUpdateEntry(id, updatedData);
    handleCloseEditDialog();
  };

  const requestDeleteEntry = (id: string) => {
    setEntryToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEntry = () => {
    if (entryToDeleteId) {
      onDeleteEntry(entryToDeleteId);
    }
    setIsDeleteDialogOpen(false);
    setEntryToDeleteId(null);
    if (editingEntry && editingEntry.id === entryToDeleteId) {
        handleCloseEditDialog();
    }
  };

  if (!clientMounted) {
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
    <>
      <Card data-ai-hint="table spreadsheet">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <ListFilter className="h-6 w-6 text-accent" />
            エントリー履歴
          </CardTitle>
          <div className="flex items-center gap-2">
            {(startDate || endDate) && (
              <Button variant="ghost" onClick={clearFilters} className="text-accent hover:text-accent/90">
                <FilterX className="mr-2 h-4 w-4" />
                フィルター解除
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setIsFilterUIVisible(!isFilterUIVisible)} 
              aria-label="フィルター設定を開閉"
              className={cn(
                "transition-colors",
                (startDate || endDate) && "border-accent text-accent hover:text-accent/90 hover:border-accent"
              )}
            >
              <ListFilter className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">フィルター</span>
            </Button>
          </div>
        </CardHeader>

        {isFilterUIVisible && (
          <div className="p-6 bg-accent/10 border border-accent/50 rounded-lg mx-0 my-4" data-ai-hint="filter controls">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Calendar Buttons Group (Left) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal bg-card hover:bg-card/90", !startDate && "text-muted-foreground")}>
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
                    <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal bg-card hover:bg-card/90", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>終了日</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Average Recovery Rate (Right, conditional) */}
              {(startDate || endDate) && filteredEntries.length > 0 && (
                <div className="mt-4 md:mt-0 text-sm text-accent font-medium flex items-center justify-center md:justify-start gap-2">
                    <Percent className="h-4 w-4" />
                    <span>選択期間の平均回収率: <span className="font-semibold">{formatPercentage(averageRecoveryRateForFiltered)}</span></span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <CardContent className={isFilterUIVisible ? 'pt-0' : 'pt-6'}>
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
                         <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} aria-label="編集">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {editingEntry && (
          <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) handleCloseEditDialog();
            else setIsEditDialogOpen(true);
          }}>
            <DialogContent className="bg-card sm:max-w-md">
              <DialogHeader>
                <UiDialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-accent"/>
                  エントリーを編集
                </UiDialogTitle>
              </DialogHeader>
              <EntryForm
                isEditMode
                id="edit-entry-form"
                initialData={editingEntry}
                onUpdateEntry={handleUpdateEntryInDialog}
                onClose={handleCloseEditDialog}
              />
              <DialogFooter className="mt-6 pt-4 border-t flex items-center justify-between">
                <Button variant="destructive" onClick={() => requestDeleteEntry(editingEntry.id)} className="min-w-[100px]">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
                <Button type="submit" form="edit-entry-form" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
                  <Edit3 className="mr-2 h-4 w-4" />
                  更新
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <UiAlertDialogTitle>本当に削除しますか？</UiAlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。エントリーが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <UiAlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              削除する
            </AlertDialogAction>
          </UiAlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
