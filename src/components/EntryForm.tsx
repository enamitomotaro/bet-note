
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
  betAmount: z.coerce.number().min(1, { message: "1円以上の掛け金を入力してください。" }),
  payoutAmount: z.coerce.number().min(0, { message: "0円以上の払戻金を入力してください。" }),
});

type EntryFormValues = z.infer<typeof formSchema>;

interface EntryFormProps {
  onAddEntry?: (entry: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  onUpdateEntry?: (id: string, entry: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
  initialData?: BetEntry;
  isEditMode?: boolean;
  onClose?: () => void; // To close dialog after submission
}

export function EntryForm({ 
  onAddEntry, 
  onUpdateEntry, 
  initialData, 
  isEditMode = false,
  onClose
}: EntryFormProps) {
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData ? parseISO(initialData.date) : new Date(),
      raceName: initialData?.raceName || "",
      betAmount: initialData?.betAmount || 100,
      payoutAmount: initialData?.payoutAmount || 0,
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
    } else {
      form.reset({
        date: new Date(),
        raceName: "",
        betAmount: 100,
        payoutAmount: 0,
      });
    }
  }, [initialData, form]);

  function onSubmit(values: EntryFormValues) {
    const entryData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    };
    if (isEditMode && initialData && onUpdateEntry) {
      onUpdateEntry(initialData.id, entryData);
    } else if (onAddEntry) {
      onAddEntry(entryData);
    }
    form.reset();
    form.setValue("date", new Date());
    if (onClose) onClose();
  }

  const cardTitleText = isEditMode ? "エントリーを編集" : "新しいエントリー記録";
  const submitButtonText = isEditMode ? "更新する" : "記録を追加";
  const SubmitIcon = isEditMode ? Edit3 : PlusCircle;

  return (
    <Card className={`mb-8 ${isEditMode ? 'border-0 shadow-none' : ''}`} data-ai-hint="form document">
      {!isEditMode && (
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <SubmitIcon className="h-6 w-6 text-accent" />
            {cardTitleText}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={isEditMode ? 'p-0' : ''}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input type="number" placeholder="1500" step="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              {isEditMode && onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  キャンセル
                </Button>
              )}
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <SubmitIcon className="mr-2 h-4 w-4" />
                {submitButtonText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
