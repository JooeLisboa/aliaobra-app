
'use server';

import { doc, runTransaction, arrayUnion, collection, getDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import type { Review, Provider, UserProfile } from '@/lib/types';
import { z } from 'zod';

const reviewSchema = z.object({
  providerId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, { message: 'Comentário precisa ter no mínimo 10 caracteres.' }),
  imageUrl: z.string().url().nullable().optional(),
  authorId: z.string().min(1),
});

export async function addReview(data: unknown) {
    if (!areCredsAvailable || !db) {
        return { success: false, error: 'A configuração do Firebase está incompleta.' };
    }
    
    const validation = reviewSchema.safeParse(data);
    if (!validation.success) {
        const errorDetails = validation.error.flatten().fieldErrors;
        console.error("Review validation failed:", errorDetails);
        return { success: false, error: 'Dados da avaliação são inválidos.' };
    }

    const { providerId, rating, comment, imageUrl, authorId } = validation.data;
    const providerRef = doc(db, 'providers', providerId);

    try {
        const newReviewId = doc(collection(db, 'temp')).id; // Generate a unique ID

        await runTransaction(db, async (transaction) => {
            const providerDoc = await transaction.get(providerRef);
            if (!providerDoc.exists()) {
                throw new Error("Provedor não encontrado!");
            }

            // SECURITY: Fetch author's profile from the server to prevent impersonation.
            let authorProfile: { name: string, avatarUrl: string } | null = null;
            const authorAsProviderRef = doc(db, 'providers', authorId);
            const authorAsProviderSnap = await transaction.get(authorAsProviderRef);
            if (authorAsProviderSnap.exists()) {
                const data = authorAsProviderSnap.data() as Provider;
                authorProfile = { name: data.name, avatarUrl: data.avatarUrl };
            } else {
                const authorAsUserRef = doc(db, 'users', authorId);
                const authorAsUserSnap = await transaction.get(authorAsUserRef);
                if (authorAsUserSnap.exists()) {
                    const data = authorAsUserSnap.data() as UserProfile;
                    authorProfile = { name: data.name, avatarUrl: `https://placehold.co/100x100.png` }; // Clients don't have avatars
                }
            }

            if (!authorProfile) {
                throw new Error("Autor da avaliação não encontrado.");
            }

            const provider = providerDoc.data() as Provider;
            
            // Construct the review object securely inside the server action
            const newReview: Review = {
                id: newReviewId,
                author: {
                    id: authorId,
                    name: authorProfile.name,
                    avatarUrl: authorProfile.avatarUrl,
                },
                rating,
                comment,
                date: new Date().toLocaleDateString('pt-BR'),
                ...(imageUrl && { imageUrl }),
            };

            const currentReviews = provider.reviews || [];
            if(currentReviews.some(r => r.author.id === authorId)) {
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
