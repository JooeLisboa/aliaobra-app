'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateStatusSchema = z.object({
  providerId: z.string(),
  status: z.enum(['Disponível', 'Em Serviço']),
  serviceAcceptedAt: z.number().optional().nullable(),
});

export async function updateProviderStatus(data: z.infer<typeof updateStatusSchema>) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const validation = updateStatusSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const { providerId, status, serviceAcceptedAt } = validation.data;
  const providerRef = doc(db, 'providers', providerId);

  try {
    await updateDoc(providerRef, {
      status: status,
      serviceAcceptedAt: serviceAcceptedAt || null,
    });

    revalidatePath(`/providers/${providerId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating provider status:', error);
    return { success: false, error: 'Falha ao atualizar o status do profissional.' };
  }
}
