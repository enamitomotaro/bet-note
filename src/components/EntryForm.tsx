
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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { BetEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  onAddEntry: (entry: Omit<BetEntry, 'id' | 'profitLoss' | 'roi'>) => void;
}

export function EntryForm({ onAddEntry }: EntryFormProps) {
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      raceName: "",
      betAmount: 100,
      payoutAmount: 0,
    },
  });

  function onSubmit(values: EntryFormValues) {
    onAddEntry({
      ...values,
      date: format(values.date, "yyyy-MM-dd"), // Store date as ISO string
    });
    form.reset(); // Reset form after submission
    form.setValue("date", new Date()); // Reset date to today
  }

  return (
    <Card className="mb-8" data-ai-hint="form document">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-accent" />
          新しいエントリー記録
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" />
              記録を追加
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
