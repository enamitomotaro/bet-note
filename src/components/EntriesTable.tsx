
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link'; // Linkコンポーネントをインポート
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
import { Pencil, Trash2, Edit3, ListChecks, FilterX, ListFilter, ArrowRight } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage, calculateAverageRecoveryRate } from '@/lib/calculations';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as UiCardTitle } from './ui/card'; // CardTitleをUiCardTitleとしてインポート
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle as UiDialogTitle, DialogClose } from "@/components/ui/dialog";
import { EntryForm } from './EntryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as UiAlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as UiAlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  displayLimit?: number; // 表示件数の制限
  viewAllLinkPath?: string; // 「全履歴を見る」ボタンのリンク先
}

export function EntriesTable({ entries, onDeleteEntry, onUpdateEntry, displayLimit, viewAllLinkPath }: EntriesTableProps) {
  const [editingEntry, setEditingEntry] = useState<BetEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isFilterUIVisible, setIsFilterUIVisible] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredEntries = useMemo(() => {
    if (!clientMounted) return [];
    let tempEntries = [...entries]; // 渡されたentriesをコピー
    if (startDate) {
      tempEntries = tempEntries.filter(entry => parseISO(entry.date) >= startDate);
    }
    if (endDate) {
      const endOfDayEndDate = new Date(endDate);
      endOfDayEndDate.setHours(23, 59, 59, 999);
      tempEntries = tempEntries.filter(entry => parseISO(entry.date) <= endOfDayEndDate);
    }
    return tempEntries;
  }, [entries, startDate, endDate, clientMounted]);
  
  const sortedAndLimitedEntries = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    if (displayLimit) {
      return sorted.slice(0, displayLimit);
    }
    return sorted;
  }, [filteredEntries, displayLimit]);

  const averageRecoveryRate = useMemo(() => {
    return calculateAverageRecoveryRate(filteredEntries);
  }, [filteredEntries]);
  
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

  const showViewAllButton = viewAllLinkPath && displayLimit && entries.length > displayLimit;

  return (
    <>
      <Card data-ai-hint="table spreadsheet">
        <CardHeader className="flex flex-row items-center justify-between">
          <UiCardTitle className="text-xl flex items-center gap-2">
            <ListChecks className={cn("h-6 w-6 text-muted-foreground")} />
            エントリー履歴
          </UiCardTitle>
          <div className="flex items-center gap-2">
            {isFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={cn(
                  "text-accent hover:bg-accent hover:text-accent-foreground",
                  isFilterActive ? "border-accent text-accent" : ""
                )}
                data-ai-hint="clear filter cross"
              >
                <FilterX className="mr-2 h-4 w-4" />
                フィルター解除
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterUIVisible(!isFilterUIVisible)}
              className={cn(
                isFilterActive ? "border-accent text-accent hover:text-accent-foreground" : ""
              )}
            >
              <ListFilter className={cn("h-4 w-4", isFilterActive ? "text-accent" : "text-muted-foreground")} />
              <span className="ml-2 hidden sm:inline">フィルター</span>
            </Button>
          </div>
        </CardHeader>
        
        {isFilterUIVisible && (
           <div className="p-6 bg-accent/10 border border-accent/50 rounded-lg mx-6 my-4" data-ai-hint="filter controls">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-grow">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-auto justify-start text-left font-normal bg-card hover:bg-card/90",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                <span className="text-muted-foreground hidden sm:inline">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                       className={cn(
                        "w-full sm:w-auto justify-start text-left font-normal bg-card hover:bg-card/90",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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

              {isFilterActive && filteredEntries.length > 0 && (
                <div className="text-sm text-muted-foreground text-center md:text-right mt-4 md:mt-0">
                  <p>
                    選択期間の平均回収率: <strong className="text-accent">{formatPercentage(averageRecoveryRate)}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <CardContent className={cn(isFilterUIVisible ? 'pt-0' : 'pt-6')}>
          {entries.length === 0 && !isFilterActive ? (
             <p className="text-muted-foreground py-4 text-center">記録されたエントリーはありません。</p>
          ) : sortedAndLimitedEntries.length === 0 && isFilterActive ? (
             <p className="text-muted-foreground py-4 text-center">選択された期間に該当するエントリーはありません。</p>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndLimitedEntries.map((entry) => (
                      <TableRow 
                        key={entry.id} 
                        onClick={() => handleEdit(entry)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>{format(parseISO(entry.date), "yyyy/MM/dd")}</TableCell>
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
