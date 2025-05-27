'use server';
/**
 * @fileOverview AI-powered race prediction flow.
 *
 * - aiRacePrediction - Predicts the horse with the highest expected value for a given race.
 * - AiRacePredictionInput - The input type for the aiRacePrediction function.
 * - AiRacePredictionOutput - The return type for the aiRacePrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiRacePredictionInputSchema = z.object({
  raceName: z.string().describe('The name of the race.'),
  date: z.string().describe('The date of the race (YYYY-MM-DD).'),
});
export type AiRacePredictionInput = z.infer<typeof AiRacePredictionInputSchema>;

const AiRacePredictionOutputSchema = z.object({
  predictedHorse: z.string().describe('The name of the horse with the highest expected value.'),
  reasoning: z.string().describe('The AI reasoning behind the prediction.'),
});
export type AiRacePredictionOutput = z.infer<typeof AiRacePredictionOutputSchema>;

export async function aiRacePrediction(input: AiRacePredictionInput): Promise<AiRacePredictionOutput> {
  return aiRacePredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRacePredictionPrompt',
  input: {schema: AiRacePredictionInputSchema},
  output: {schema: AiRacePredictionOutputSchema},
  prompt: `You are an expert horse racing analyst. Given the race name and date, analyze real-time data and predict the horse with the highest expected value.

  Race Name: {{{raceName}}}
  Date: {{{date}}}

  Consider factors like past performance, track conditions, jockey, and odds.
  Provide a brief explanation of your reasoning.
  `,  
});

const aiRacePredictionFlow = ai.defineFlow(
  {
    name: 'aiRacePredictionFlow',
    inputSchema: AiRacePredictionInputSchema,
    outputSchema: AiRacePredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
