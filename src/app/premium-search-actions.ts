// src/app/premium-search-actions.ts
'use server';

import { findBestProvider } from '@/ai/flows/find-best-provider-flow';
import { getProvider } from '@/lib/data';

export async function findBestProviderForProject(projectDescription: string) {
  try {
    const result = await findBestProvider({ projectDescription });
    
    if (!result.providerId) {
        return { success: false, error: 'A IA não conseguiu determinar um profissional. Tente detalhar mais seu projeto.', provider: null };
    }

    const provider = await getProvider(result.providerId);
    if (!provider) {
        return { success: false, error: 'O profissional recomendado pela IA não foi encontrado no banco de dados.', provider: null };
    }

    return { success: true, provider };
  } catch (e: any) {
    console.error("Error in premium search action:", e);
    return { success: false, error: 'Ocorreu um erro inesperado durante a busca com IA.', provider: null };
  }
}
