
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
import { Pencil, Percent, Edit3, Trash2, ListChecks, FilterX } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage, calculateAverageRecoveryRate } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle as UiDialogTitle, DialogClose } from "@/components/ui/dialog";
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
import { CalendarIcon, ListFilter } from "lucide-react";


interface EntriesTableProps {
  entries: BetEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updatedData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
}

export function EntriesTable({ entries, onDeleteEntry, onUpdateEntry }: EntriesTableProps) {
  const [editingEntry, setEditingEntry] = useState<BetEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [entries]);

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


  return (
    <>
      <Card data-ai-hint="table spreadsheet">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <ListChecks className={cn("h-6 w-6 text-muted-foreground")} />
            エントリー履歴
          </CardTitle>
        </CardHeader>
        
        <CardContent className={cn('pt-0')}>
          {sortedEntries.length === 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map((entry) => (
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
