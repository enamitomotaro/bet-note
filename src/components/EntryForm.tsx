
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Edit3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { BetEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

const formSchema = z.object({
  date: z.date({
    required_error: "日付を入力してください。",
  }),
  raceName: z.string().optional(),
  betAmount: z.coerce.number().min(1, { message: "1円以上の掛け金を入力してください。" }).step(100),
  payoutAmount: z.preprocess(
    (v) => v === '' || v === undefined || v === null ? null : Number(v),
    z.number().min(0, { message: "0円以上の払戻金を入力してください。" }).step(10).nullable()
  ),
});

type EntryFormValues = z.infer<typeof formSchema>;

interface EntryFormProps {
  id?: string; 
  onAddEntry?: (entry: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  onUpdateEntry?: (id: string, entry: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  initialData?: BetEntry;
  isEditMode?: boolean;
  onClose?: () => void;
  isInDialog?: boolean; // 新しく追加したフラグ
}

export function EntryForm({ 
  id,
  onAddEntry, 
  onUpdateEntry, 
  initialData, 
  isEditMode = false,
  onClose,
  isInDialog = false, // 初期値は false
}: EntryFormProps) {
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData ? parseISO(initialData.date) : new Date(),
      raceName: initialData?.raceName || "",
      betAmount: initialData?.betAmount || 100,
      payoutAmount: initialData?.payoutAmount ?? null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        date: parseISO(initialData.date),
        raceName: initialData.raceName || "",
        betAmount: initialData.betAmount,
        payoutAmount: initialData.payoutAmount,
      });
    } else if (!isEditMode) { 
      form.reset({
        date: new Date(),
        raceName: "",
        betAmount: 100,
        payoutAmount: null,
      });
    }
  }, [initialData, form, isEditMode]);

  function onSubmit(values: EntryFormValues) {
    const entryData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    };
    if (isEditMode && initialData?.id && onUpdateEntry) {
      onUpdateEntry(initialData.id, entryData);
    } else if (onAddEntry) {
      onAddEntry(entryData);
      if (!isEditMode) { // ダイアログでない新規フォームの場合のみリセット
        form.reset({ 
          date: new Date(),
          raceName: "",
          betAmount: 100,
          payoutAmount: null,
        });
      }
    }
    if (onClose) onClose(); // onClose が渡された場合は実行（ダイアログ用）
  }

  const cardTitleText = isEditMode ? "エントリーを編集" : "新しいエントリー記録";
  const SubmitIconForAddMode = PlusCircle;
  const submitButtonTextForAddMode = "記録を追加";

  return (
    <Card className={cn(
        "mb-8", 
        isInDialog ? 'border-0 shadow-none p-0' : ''
      )} data-ai-hint="form document">
      {!isEditMode && !isInDialog && ( // 編集フォームでもダイアログ内でもないときだけヘッダーを表示
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-accent" />
            {cardTitleText}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={isInDialog ? 'p-0' : ''}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id={id}>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>日付</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>日付を選択</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="raceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>レース名 (任意)</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 有馬記念" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="betAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>掛け金 (円)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" step="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payoutAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>払戻金 (円)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1500" step="10" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Render submit buttons only if NOT in dialog mode */}
            {!isInDialog && !isEditMode && ( 
              <div className="flex justify-center gap-4 mt-8">
                <Button type="button" variant="outline" onClick={() => {
                    form.reset({
                      date: new Date(),
                      raceName: "",
                      betAmount: 100,
                      payoutAmount: null,
                    });
                  }}>
                    リセット
                  </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <SubmitIconForAddMode className="mr-2 h-4 w-4" />
                  {submitButtonTextForAddMode}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
