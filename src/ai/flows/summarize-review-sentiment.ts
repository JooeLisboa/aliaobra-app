'use server';

/**
 * @fileOverview A flow that summarizes the sentiment of a user review.
 *
 * - summarizeReviewSentiment - A function that summarizes the sentiment of a user review.
 * - SummarizeReviewSentimentInput - The input type for the summarizeReviewSentiment function.
 * - SummarizeReviewSentimentOutput - The return type for the summarizeReviewSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewSentimentInputSchema = z.object({
  reviewText: z.string().describe('The text content of the review to summarize.'),
});
export type SummarizeReviewSentimentInput = z.infer<typeof SummarizeReviewSentimentInputSchema>;

const SummarizeReviewSentimentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the sentiment expressed in the review.'),
});
export type SummarizeReviewSentimentOutput = z.infer<typeof SummarizeReviewSentimentOutputSchema>;

export async function summarizeReviewSentiment(input: SummarizeReviewSentimentInput): Promise<SummarizeReviewSentimentOutput> {
  return summarizeReviewSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReviewSentimentPrompt',
  input: {schema: SummarizeReviewSentimentInputSchema},
  output: {schema: SummarizeReviewSentimentOutputSchema},
  prompt: `Summarize the sentiment of the following review, identifying key themes and performance highlights:\n\nReview: {{{reviewText}}}`,
});

const summarizeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'summarizeReviewSentimentFlow',
    inputSchema: SummarizeReviewSentimentInputSchema,
    outputSchema: SummarizeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
