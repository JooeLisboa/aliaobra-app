
'use server';

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Provider } from './types';

const updatePlanSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório.'),
  planId: z.enum(['basico', 'profissional', 'agencia']),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
});


// ====================================================================================
// IMPORTANTE PARA MONETIZAÇÃO REAL:
// Em um ambiente de produção, esta função NUNCA deve ser chamada diretamente
// pelo front-end após o clique de um botão. Ela deve ser acionada por um WEBHOOK seguro
// do seu provedor de pagamento (ex: Stripe, Mercado Pago) DEPOIS que um pagamento
// for confirmado com sucesso. Isso garante que os usuários não possam obter um plano
// pago sem efetivamente pagar por ele.
// ====================================================================================
export async function updateUserPlan(data: z.infer<typeof updatePlanSchema>) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const validation = updatePlanSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados do plano inválidos.' };
  }

  const { userId, planId, userName, userEmail } = validation.data;
  const providerRef = doc(db, 'providers', userId);

  try {
    const docSnap = await getDoc(providerRef);
    const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
    const isVerified = planId === 'profissional' || planId === 'agencia';

    if (!docSnap.exists()) {
      // Profile doesn't exist, so create it. This happens when a client upgrades.
      if (!userName || !userEmail) {
         return { success: false, error: "Informações do usuário ausentes para criar um novo perfil de provedor." };
      }
      
      const userType = planId === 'agencia' ? 'agency' : 'provider';
      
      const newProvider: Provider = {
           id: userId,
           name: userName,
           category: 'Não especificada',
           location: 'Não informada',
           avatarUrl: `https://placehold.co/100x100.png`,
           rating: 0,
           reviewCount: 0,
           bio: `Perfil de ${userName}. Complete suas informações na página de edição.`,
           skills: [],
           status: 'Disponível',
           portfolio: [],
           reviews: [],
           isVerified: isVerified,
           type: userType,
           plan: planName as Provider['plan'],
       };
       await setDoc(providerRef, newProvider);

    } else {
      // Profile exists, just update it
      await updateDoc(providerRef, {
        plan: planName as Provider['plan'],
        isVerified: isVerified,
      });
    }

    revalidatePath(`/providers/${userId}`);
    revalidatePath(`/profile/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error updating user plan:', error);
    return { success: false, error: 'Falha ao atualizar o plano.' };
  }
}
