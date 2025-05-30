
"use client";

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
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
import { Pencil, Trash2, Edit3, ListChecks, ArrowRight, Filter, ArrowUpDown, Search, CalendarIcon as LucideCalendarIcon, FilterX } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage, calculateAverageRecoveryRate } from '@/lib/calculations';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as UiCardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle as UiDialogTitle } from "@/components/ui/dialog";
import { EntryForm } from './EntryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as UiAlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";


interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  displayLimit?: number;
  viewAllLinkPath?: string;
  showFilterControls?: boolean;
}

export function EntriesTable({
  entries,
  onDeleteEntry,
  onUpdateEntry,
  displayLimit,
  viewAllLinkPath,
  showFilterControls = true,
}: EntriesTableProps) {
  const [editingEntry, setEditingEntry] = useState<BetEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const internalFilteredEntries = useMemo(() => {
    if (!clientMounted) return [];
    if (!showFilterControls) return entries;

    let tempEntries = [...entries];
    if (startDate) {
      const filterStart = startOfDay(parseISO(format(startDate, "yyyy-MM-dd")));
      tempEntries = tempEntries.filter(entry => startOfDay(parseISO(entry.date)) >= filterStart);
    }
    if (endDate) {
      const filterEnd = startOfDay(parseISO(format(endDate, "yyyy-MM-dd")));
      tempEntries = tempEntries.filter(entry => startOfDay(parseISO(entry.date)) <= filterEnd);
    }
    return tempEntries;
  }, [entries, startDate, endDate, clientMounted, showFilterControls]);

  const sortedAndLimitedEntries = useMemo(() => {
    const entriesToProcess = internalFilteredEntries;
    const sorted = [...entriesToProcess].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    if (displayLimit) {
      return sorted.slice(0, displayLimit);
    }
    return sorted;
  }, [internalFilteredEntries, displayLimit]);

  const averageRecoveryRate = useMemo(() => {
    return calculateAverageRecoveryRate(internalFilteredEntries);
  }, [internalFilteredEntries]);

  const isFilterActive = startDate || endDate;

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

  const showViewAllButton = viewAllLinkPath && displayLimit && internalFilteredEntries.length > displayLimit;

  let filterControlElements: ReactNode = null;
  if (showFilterControls) {
    filterControlElements = (
      <div className="flex items-center gap-1 ml-auto">
        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("hover:bg-accent/10", isFilterActive ? "text-accent" : "text-muted-foreground")}
              aria-label="フィルター"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 space-y-4 bg-card shadow-xl rounded-lg border" align="end">
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">期間で絞り込み</p>
              <div className="grid grid-cols-1 gap-2">
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <LucideCalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>開始日</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => endDate ? date > endDate : false}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                       className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <LucideCalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>終了日</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {isFilterActive && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full text-accent hover:bg-accent/10"
              >
                <FilterX className="mr-2 h-4 w-4" />
                フィルターを解除
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Sort Button (Placeholder) */}
        <Button variant="ghost" size="icon" disabled className="cursor-not-allowed opacity-50 text-muted-foreground" aria-label="並べ替え">
          <ArrowUpDown className="h-4 w-4" />
        </Button>

        {/* Search Button (Placeholder) */}
        <Button variant="ghost" size="icon" disabled className="cursor-not-allowed opacity-50 text-muted-foreground" aria-label="検索">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card data-ai-hint="table spreadsheet">
        <CardHeader className="flex flex-row items-center justify-between">
          <UiCardTitle className="text-xl flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-muted-foreground" />
            エントリー履歴
          </UiCardTitle>
          {filterControlElements}
        </CardHeader>

        {showFilterControls && isFilterActive && internalFilteredEntries.length > 0 && (
           <div className="px-6 py-3 border-b text-sm text-muted-foreground">
            選択期間の平均回収率: <strong className="text-accent">{formatPercentage(averageRecoveryRate)}</strong>
          </div>
        )}

        <CardContent className={cn("pt-6", (showFilterControls && isFilterActive && internalFilteredEntries.length > 0) ? 'pt-3' : 'pt-6', displayLimit ? 'max-h-[24rem] overflow-y-auto' : '')}>
          {(internalFilteredEntries).length === 0 && !isFilterActive && showFilterControls ? (
             <p className="text-muted-foreground py-4 text-center">記録されたエントリーはありません。</p>
          ) : sortedAndLimitedEntries.length === 0 && isFilterActive && showFilterControls ? (
             <p className="text-muted-foreground py-4 text-center">選択された期間に該当するエントリーはありません。</p>
          ) : sortedAndLimitedEntries.length === 0 && !showFilterControls && entries.length === 0 ? (
             <p className="text-muted-foreground py-4 text-center">記録されたエントリーはありません。</p>
          ) : (
            <ScrollArea className={cn(displayLimit && sortedAndLimitedEntries.length > displayLimit ? `h-[calc(6*2.5rem+1rem)]` : '')}> {/* Adjusted height for ~6 items */}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndLimitedEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        onClick={() => handleEdit(entry)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>{isValid(parseISO(entry.date)) ? format(parseISO(entry.date), "yyyy/MM/dd") : '-'}</TableCell>
                        <TableCell>{entry.raceName || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.betAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.payoutAmount)}</TableCell>
                        <TableCell className={`text-right font-medium ${entry.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.profitLoss)}
                        </TableCell>
                        <TableCell className="text-right">{formatPercentage(entry.roi)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        {showViewAllButton && viewAllLinkPath && (
          <CardFooter className="justify-center pt-4 border-t">
            <Link href={viewAllLinkPath} passHref legacyBehavior>
              <Button variant="outline" className="w-full sm:w-auto">
                全履歴を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        )}

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
                id="edit-entry-form-in-dialog"
                initialData={editingEntry}
                onUpdateEntry={handleUpdateEntryInDialog}
                onClose={handleCloseEditDialog}
                isInDialog={true}
              />
              <DialogFooter className="mt-6 pt-4 border-t flex items-center justify-between">
                 <Button
                    variant="destructive"
                    onClick={() => requestDeleteEntry(editingEntry.id)}
                    className="min-w-[100px]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
                <Button
                    type="submit"
                    form="edit-entry-form-in-dialog"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[100px]"
                >
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
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
