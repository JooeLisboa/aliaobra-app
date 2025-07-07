'use server';

import { doc, runTransaction, arrayUnion } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import type { Review, Provider } from '@/lib/types';
import * as z from 'zod';

const reviewSchema = z.object({
  providerId: z.string().min(1, { message: 'ID do provedor é obrigatório.' }),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, { message: 'Comentário precisa ter no mínimo 10 caracteres.' }),
  imageUrl: z.string().url().nullable().optional(),
  author: z.object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().url(),
  })
});

export async function addReview(data: unknown) {
    if (!areCredsAvailable || !db) {
        return { success: false, error: 'A configuração do Firebase está incompleta. Contate o suporte.' };
    }
    
    const validation = reviewSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados da avaliação são inválidos: ' + validation.error.flatten().fieldErrors };
    }

    const { providerId, author, rating, comment, imageUrl } = validation.data;
    const providerRef = doc(db, 'providers', providerId);

    try {
        const newReviewId = doc(collection(db, 'temp')).id;

        await runTransaction(db, async (transaction) => {
            const providerDoc = await transaction.get(providerRef);
            if (!providerDoc.exists()) {
                throw new Error("Provedor não encontrado!");
            }

            const provider = providerDoc.data() as Provider;
            
            const newReview: Review = {
                id: newReviewId,
                author,
                rating,
                comment,
                date: new Date().toLocaleDateString('pt-BR'),
                ...(imageUrl && { imageUrl }),
            };

            const currentReviews = provider.reviews || [];
            if(currentReviews.some(r => r.author.id === author.id)) {
                // For this prototype, we'll prevent multiple reviews.
                // A real app might allow editing the existing review.
                throw new Error("Você já avaliou este profissional.");
            }

            const newReviewCount = currentReviews.length + 1;
            const newRating = ( (provider.rating * currentReviews.length) + newReview.rating ) / newReviewCount;

            transaction.update(providerRef, {
                reviews: arrayUnion(newReview),
                reviewCount: newReviewCount,
                rating: parseFloat(newRating.toFixed(2)), // Keep it to 2 decimal places
            });
        });

        return { success: true };
    } catch (e: any) {
        console.error("Falha na transação ao adicionar avaliação: ", e);
        return { success: false, error: e.message || "Não foi possível adicionar a avaliação." };
    }
}
