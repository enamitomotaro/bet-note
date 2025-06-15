
"use client";

import { AppHeader } from '@/components/AppHeader';
import type { LucideIcon } from 'lucide-react';
import { Home, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation'; // useRouter は不要なので削除
import React, { useState } from 'react'; // clientMounted 用の useEffect は不要
import { useBetEntries } from '@/hooks/useBetEntries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { EntryForm } from '@/components/EntryForm';
import { Button } from '@/components/ui/button';
import type { BetEntry } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { DashboardDialogProvider } from '@/contexts/DashboardDialogContext'; // 追加したダイアログプロバイダー

export const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: Home },
  { href: '/dashboard/entries', label: 'エントリー履歴', icon: ListChecks },
];

const APP_NAME = "BetNote";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { addEntry } = useBetEntries();
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);

  const handleOpenAddEntryDialog = () => {
    setIsAddEntryDialogOpen(true);
  };

  const handleAddEntrySubmit = (entryData: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => {
    addEntry(entryData);
    setIsAddEntryDialogOpen(false);
  };

  return (
    <DashboardDialogProvider> {/* プロバイダーをここに配置 */}
      <div className="flex flex-col min-h-screen">
        <AppHeader
          appName={APP_NAME}
          navItems={navItems}
          onOpenAddEntryDialog={handleOpenAddEntryDialog}
        />

        <main className="flex-grow space-y-8 container mx-auto px-4 md:px-8 py-6">
          {children}
        </main>
        <footer className="border-t py-4 mt-auto">
          <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </footer>

        <Dialog open={isAddEntryDialogOpen} onOpenChange={setIsAddEntryDialogOpen}>
          <DialogContent className="bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-accent"/>
                新しいエントリー記録
              </DialogTitle>
            </DialogHeader>
            <EntryForm
              id="add-entry-form-in-dialog"
              onAddEntry={handleAddEntrySubmit}
              onClose={() => setIsAddEntryDialogOpen(false)}
              isInDialog={true}
            />
            <DialogFooter className="mt-6 pt-4 border-t flex items-center justify-end gap-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">キャンセル</Button>
              </DialogClose>
              <Button type="submit" form="add-entry-form-in-dialog" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" />
                記録を追加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardDialogProvider>
  );
}
