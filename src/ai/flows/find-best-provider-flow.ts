// src/ai/flows/find-best-provider-flow.ts
'use server';
/**
 * @fileOverview An AI flow to find the best service provider for a given project.
 *
 * - findBestProvider - A function that takes a project description and returns the most suitable provider.
 * - FindBestProviderInput - The input type for the findBestProvider function.
 * - FindBestProviderOutput - The return type for the findBestProvider function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProviders } from '@/lib/data';
import type { Provider } from '@/lib/types';

// Define tools available to the AI
const getAllProvidersTool = ai.defineTool(
  {
    name: 'getAllProvidersTool',
    description: 'Get a list of all available service providers from the database.',
    inputSchema: z.void(),
    outputSchema: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            category: z.string(),
            location: z.string(),
            bio: z.string(),
            skills: z.array(z.string()),
            rating: z.number(),
            reviewCount: z.number(),
            plan: z.string(),
        })
    ),
  },
  async () => {
    console.log('AI is using the getAllProvidersTool...');
    const providers = await getProviders();
    // We only return a subset of fields to the AI to keep the context concise
    return providers.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        location: p.location,
        bio: p.bio,
        skills: p.skills,
        rating: p.rating,
        reviewCount: p.reviewCount,
        plan: p.plan,
    }));
  }
);


export const FindBestProviderInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the project the user needs help with.'),
});
export type FindBestProviderInput = z.infer<typeof FindBestProviderInputSchema>;

export const FindBestProviderOutputSchema = z.object({
  reasoning: z.string().describe('A brief explanation of why this provider was chosen.'),
  providerId: z.string().describe('The ID of the recommended provider.'),
});
export type FindBestProviderOutput = z.infer<typeof FindBestProviderOutputSchema>;


const findProviderPrompt = ai.definePrompt({
    name: 'findProviderPrompt',
    input: { schema: FindBestProviderInputSchema },
    output: { schema: FindBestProviderOutputSchema },
    tools: [getAllProvidersTool],
    prompt: `You are an expert project manager for a construction services marketplace called AliaObra.
    Your task is to analyze a client's project description and recommend the single best professional from a list of available providers.

    Follow these steps:
    1.  Use the 'getAllProvidersTool' to get a list of all available service providers.
    2.  Carefully analyze the client's project description: {{{projectDescription}}}
    3.  Compare the project needs against the provider list, considering the following criteria in order of importance:
        a.  **Skills and Category:** The provider's main category and listed skills must match the project's requirements. This is the most important factor.
        b.  **Bio and Experience:** The provider's bio should indicate experience with similar projects.
        c.  **Location:** Prefer providers in the same location if mentioned in the project description.
        d.  **Rating and Reviews:** A higher rating and more reviews are strong positive signals.
        e.  **Plan:** Providers on 'profissional' or 'agência' plans are generally more committed. Prefer them over 'básico' if other factors are equal.
    4.  Select the ONE provider that is the absolute best fit.
    5.  Provide a brief reasoning for your choice and output the chosen provider's ID.
    `,
});

const findBestProviderFlow = ai.defineFlow(
  {
    name: 'findBestProviderFlow',
    inputSchema: FindBestProviderInputSchema,
    outputSchema: FindBestProviderOutputSchema,
  },
  async (input) => {
    const { output } = await findProviderPrompt(input);
    return output!;
  }
);

// Exported wrapper function to be called from server actions
export async function findBestProvider(input: FindBestProviderInput): Promise<FindBestProviderOutput> {
  return findBestProviderFlow(input);
}
