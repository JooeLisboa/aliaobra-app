'use server';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Provider } from './types';

const updatePlanSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório.'),
  planId: z.enum(['basico', 'profissional', 'agencia']),
});

export async function updateUserPlan(data: z.infer<typeof updatePlanSchema>) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const validation = updatePlanSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados do plano inválidos.' };
  }

  const { userId, planId } = validation.data;
  const providerRef = doc(db, 'providers', userId);

  try {
    const docSnap = await getDoc(providerRef);
    if (!docSnap.exists()) {
      return { success: false, error: "Perfil de provedor não encontrado. Crie um perfil de profissional ou agência primeiro." };
    }

    const planName = planId.charAt(0).toUpperCase() + planId.slice(1);

    await updateDoc(providerRef, {
      plan: planName as Provider['plan'],
      isVerified: planId === 'profissional' || planId === 'agencia' ? true : false,
    });

    revalidatePath(`/providers/${userId}`);
    revalidatePath(`/profile/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error updating user plan:', error);
    return { success: false, error: 'Falha ao atualizar o plano.' };
  }
}
