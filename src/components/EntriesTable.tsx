
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
  TableFooter,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Edit3, ListChecks, ArrowRight, Filter as FilterIcon, ArrowUpDown, Search as SearchIcon, CalendarIcon as LucideCalendarIcon, FilterX, X as XIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { format, parseISO, isValid, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { Card, CardContent, CardFooter as UiCardFooter, CardHeader, CardTitle as UiCardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter as UiDialogFooter, DialogHeader, DialogTitle as UiDialogTitle } from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";

interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  displayLimit?: number;
  viewAllLinkPath?: string;
  showFilterControls?: boolean;
}

type SortableColumn = keyof BetEntry | 'profitLoss' | 'roi';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortableColumn;
  direction: SortDirection;
}

const sortableColumns: { key: SortableColumn, label: string }[] = [
  { key: 'date', label: '日付' },
  { key: 'raceName', label: 'レース名' },
  { key: 'betAmount', label: '掛け金' },
  { key: 'payoutAmount', label: '払戻金' },
  { key: 'profitLoss', label: '損益' },
  { key: 'roi', label: '回収率' },
];


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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  
  const [isDateFilterPopoverOpen, setIsDateFilterPopoverOpen] = useState(false);
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);


  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleSort = (key: SortableColumn) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key && prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
    if (isSortPopoverOpen) setIsSortPopoverOpen(false); 
  };
  
  const filteredAndSortedEntries = useMemo(() => {
    if (!clientMounted) return [];

    let processedEntries = [...entries];

    if (showFilterControls) {
      if (startDate) {
        const filterStart = startOfDay(startDate);
        processedEntries = processedEntries.filter(entry => {
          const entryDate = startOfDay(parseISO(entry.date));
          return entryDate >= filterStart;
        });
      }
      if (endDate) {
        const filterEnd = startOfDay(endDate);
        processedEntries = processedEntries.filter(entry => {
          const entryDate = startOfDay(parseISO(entry.date));
          return entryDate <= filterEnd;
        });
      }
    }

    if (searchQuery) {
      processedEntries = processedEntries.filter(entry =>
        entry.raceName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig.key) {
      processedEntries.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof BetEntry];
        const bValue = b[sortConfig.key as keyof BetEntry];

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (sortConfig.key === 'date') {
           comparison = parseISO(a.date).getTime() - parseISO(b.date).getTime();
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    return processedEntries;
  }, [entries, startDate, endDate, searchQuery, sortConfig, clientMounted, showFilterControls]);

  const entriesForTable = useMemo(() => {
    // For dashboard view, if displayLimit is set, slice the entries.
    // showFilterControls will be false for dashboard's EntriesTable instance.
    if (displayLimit && showFilterControls === false) { 
      return filteredAndSortedEntries.slice(0, displayLimit);
    }
    // For the dedicated entries page (showFilterControls === true), show all filtered/sorted entries.
    return filteredAndSortedEntries;
  }, [filteredAndSortedEntries, displayLimit, showFilterControls]);


  const {
    totalBetAmount,
    totalPayoutAmount,
    totalProfitLoss,
    overallRecoveryRateForFooter,
  } = useMemo(() => {
    const sourceForTotals = filteredAndSortedEntries; // Use all filtered entries for totals

    if (!clientMounted || sourceForTotals.length === 0) {
      return {
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalProfitLoss: 0,
        overallRecoveryRateForFooter: 0,
      };
    }

    const currentTotalBetAmount = sourceForTotals.reduce((sum, entry) => sum + entry.betAmount, 0);
    const currentTotalPayoutAmount = sourceForTotals.reduce((sum, entry) => sum + entry.payoutAmount, 0);
    const currentTotalProfitLoss = currentTotalPayoutAmount - currentTotalBetAmount;
    const currentOverallRecoveryRate = currentTotalBetAmount > 0 ? (currentTotalPayoutAmount / currentTotalBetAmount) * 100 : 0;

    return {
      totalBetAmount: currentTotalBetAmount,
      totalPayoutAmount: currentTotalPayoutAmount,
      totalProfitLoss: currentTotalProfitLoss,
      overallRecoveryRateForFooter: currentOverallRecoveryRate,
    };
  }, [filteredAndSortedEntries, clientMounted]);


  const isDateFilterActive = startDate || endDate;

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDateFilterPopoverOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchPopoverOpen(false);
  }

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
  
  const showViewAllButton = viewAllLinkPath && displayLimit && filteredAndSortedEntries.length > displayLimit && showFilterControls === false;


  let filterControlElements: ReactNode = null;
  if (showFilterControls) {
    filterControlElements = (
      <div className="flex items-center gap-1 ml-auto">
        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:bg-accent/20 hover:text-accent" 
              aria-label="検索"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-2 bg-card shadow-xl rounded-lg border" align="end">
            <Label htmlFor="search-race" className="text-sm font-medium">レース名で検索</Label>
            <div className="flex items-center gap-2">
              <Input
                id="search-race"
                type="text"
                placeholder="レース名を入力..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" onClick={clearSearch} aria-label="検索をクリア">
                  <XIcon className="h-4 w-4 text-muted-foreground"/>
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={isSortPopoverOpen} onOpenChange={setIsSortPopoverOpen}>
            <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:bg-accent/20 hover:text-accent"
                  aria-label="並べ替え"
                >
                <ArrowUpDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-card shadow-xl rounded-lg border" align="end">
                <p className="p-2 text-sm font-medium text-card-foreground">並べ替え</p>
                {sortableColumns.map(col => (
                <Button
                    key={col.key}
                    variant="ghost"
                    onClick={() => handleSort(col.key)}
                    className={cn(
                    "w-full justify-start text-sm",
                    sortConfig.key === col.key ? "bg-accent/10 text-accent" : ""
                    )}
                >
                    {col.label}
                    {sortConfig.key === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />
                    )}
                </Button>
                ))}
            </PopoverContent>
        </Popover>

        <Popover open={isDateFilterPopoverOpen} onOpenChange={setIsDateFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-accent/20 hover:text-accent", 
                isDateFilterActive ? "text-accent" : "text-muted-foreground"
              )}
              aria-label="期間フィルター"
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card shadow-xl rounded-lg border" align="end">
            <div className="p-4 space-y-3">
                <p className="text-sm font-medium text-card-foreground mb-1">期間で絞り込み</p>
                <Calendar
                    mode="range"
                    locale={ja}
                    selected={{ from: startDate, to: endDate }}
                    onSelect={(range) => {
                        setStartDate(range?.from);
                        setEndDate(range?.to);
                    }}
                    numberOfMonths={1}
                />
                {isDateFilterActive && (
                <Button
                    variant="ghost"
                    onClick={clearDateFilters}
                    className="w-full text-accent hover:bg-accent/10 mt-2"
                >
                    <FilterX className="mr-2 h-4 w-4" />
                    フィルターを解除
                </Button>
                )}
            </div>
          </PopoverContent>
        </Popover>
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

        <CardContent className={cn("pt-6", (displayLimit && entriesForTable.length > 0 && showFilterControls === false) ? "pb-0" : "")}>
          {(entriesForTable).length === 0 && !isDateFilterActive && showFilterControls && entries.length === 0 ? (
             <p className="text-muted-foreground py-4 text-center">記録されたエントリーはありません。</p>
          ) : entriesForTable.length === 0 && (isDateFilterActive || searchQuery) && showFilterControls ? (
             <p className="text-muted-foreground py-4 text-center">条件に該当するエントリーはありません。</p>
          ) : entriesForTable.length === 0 && !showFilterControls && entries.length === 0 ? (
             <p className="text-muted-foreground py-4 text-center">記録されたエントリーはありません。</p>
          ) : (
            <ScrollArea 
                className={cn((displayLimit && entriesForTable.length >= displayLimit && showFilterControls === false) ? 'max-h-[calc(5*3.5rem+2.25rem+3rem)]' : '')} 
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {sortableColumns.map(col => (
                        <TableHead 
                          key={col.key} 
                          className={cn(
                            showFilterControls ? "cursor-pointer hover:bg-muted/50" : "",
                            "whitespace-nowrap", 
                            col.key === 'betAmount' || col.key === 'payoutAmount' || col.key === 'profitLoss' || col.key === 'roi' ? 'text-right' : ''
                          )}
                          onClick={() => showFilterControls && handleSort(col.key)}
                        >
                          <div className={cn("flex items-center", col.key === 'betAmount' || col.key === 'payoutAmount' || col.key === 'profitLoss' || col.key === 'roi' ? 'justify-end' : '')}>
                            {col.label}
                            {showFilterControls && sortConfig.key === col.key && (
                              sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entriesForTable.map((entry) => (
                      <TableRow
                        key={entry.id}
                        onClick={() => handleEdit(entry)}
                        className="cursor-pointer hover:bg-muted/50 h-[3.5rem]"
                      >
                        <TableCell>{isValid(parseISO(entry.date)) ? format(parseISO(entry.date), "yyyy/MM/dd") : '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{entry.raceName || "-"}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{formatCurrency(entry.betAmount)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{formatCurrency(entry.payoutAmount)}</TableCell>
                        <TableCell className={`text-right font-medium whitespace-nowrap ${entry.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.profitLoss)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">{formatPercentage(entry.roi)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {filteredAndSortedEntries.length > 0 && ( 
                     <TableFooter>
                        <TableRow className="h-[3rem] border-t">
                          <TableCell colSpan={2} className="font-medium text-muted-foreground">合計</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(totalBetAmount)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(totalPayoutAmount)}</TableCell>
                          <TableCell className={`text-right font-medium ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(totalProfitLoss)}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatPercentage(overallRecoveryRateForFooter)}</TableCell>
                        </TableRow>
                      </TableFooter>
                  )}
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        {showViewAllButton && (
          <UiCardFooter className="justify-center pt-4 border-t">
            <Link href={viewAllLinkPath!} passHref legacyBehavior>
              <Button variant="outline" className="w-full sm:w-auto">
                全履歴を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </UiCardFooter>
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
              <UiDialogFooter className="mt-6 pt-4 border-t flex items-center justify-between">
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
              </UiDialogFooter>
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
