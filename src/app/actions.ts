'use server';

import { summarizeReviewSentiment } from '@/ai/flows/summarize-review-sentiment';
import { z } from 'zod';

const inputSchema = z.object({
  reviewText: z.string().min(10, { message: 'Review text must be at least 10 characters long.' }),
});

export async function getReviewSummary(formData: FormData) {
  const rawData = {
    reviewText: formData.get('reviewText'),
  };

  const validation = inputSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const result = await summarizeReviewSentiment({ reviewText: validation.data.reviewText });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred while generating the summary.' };
  }
}
