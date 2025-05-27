"use client";

import { useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Sparkles, Loader2, Brain } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { aiRacePrediction, type AiRacePredictionOutput, type AiRacePredictionInput } from "@/ai/flows/ai-race-prediction";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const predictionFormSchema = z.object({
  raceName: z.string().min(1, { message: "レース名を入力してください。" }),
  date: z.date({
    required_error: "日付を入力してください。",
  }),
});

type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export function AiPredictor() {
  const [prediction, setPrediction] = useState<AiRacePredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      raceName: "",
      date: new Date(),
    },
  });

  async function onSubmit(values: PredictionFormValues) {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const input: AiRacePredictionInput = {
        ...values,
        date: format(values.date, "yyyy-MM-dd"),
      };
      const result = await aiRacePrediction(input);
      setPrediction(result);
    } catch (e) {
      setError("AI予想の取得中にエラーが発生しました。");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card data-ai-hint="robot ai">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          AI予想ツール
        </CardTitle>
        <CardDescription>レース名と日付を入力して、AIによる期待値の高い馬の予想を取得します。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="raceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>レース名</FormLabel>
                    <FormControl>
                      <Input placeholder="例: ジャパンカップ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                             date < new Date(new Date().setDate(new Date().getDate() -1)) // Allow today and future dates
                           }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Brain className="mr-2 h-4 w-4" />
              )}
              AIに予想を依頼
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {prediction && (
        <CardFooter className="mt-0 pt-0">
            <Card className="w-full bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI予想結果
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p>
                        <strong>推奨馬:</strong> {prediction.predictedHorse}
                    </p>
                    <p className="text-sm">
                        <strong>理由:</strong> {prediction.reasoning}
                    </p>
                </CardContent>
            </Card>
        </CardFooter>
        )}
    </Card>
  );
}
