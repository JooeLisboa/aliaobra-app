'use server';

import { collection, addDoc, doc, runTransaction, getDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirebaseAdmin } from './firebase-admin';
import { headers } from 'next/headers';
import type { UserProfile, Provider } from './types';

// Helper function to decode the Firebase auth token from headers
async function getUserIdFromToken() {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }
    const token = authorization.split('Bearer ')[1];
    if (!token) return null;

    try {
        const { auth } = getFirebaseAdmin();
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}


const createServiceSchema = z.object({
  title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres.').max(100, 'O título é muito longo.'),
  description: z.string().min(20, 'A descrição deve ter no mínimo 20 caracteres.').max(2000, 'A descrição é muito longa.'),
  category: z.string().min(3, 'A categoria é obrigatória.'),
  budget: z.coerce.number().positive('O orçamento deve ser um número positivo.'),
});

export async function createService(formData: FormData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const clientId = await getUserIdFromToken();
  if (!clientId) {
      return { success: false, error: 'Usuário não autenticado.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = createServiceSchema.safeParse(rawData);

  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Dados inválidos.', details: validation.error.flatten().fieldErrors };
  }

  const { title, description, category, budget } = validation.data;
  
  try {
    // SECURITY: Fetch client name from server to prevent impersonation.
    let clientName = 'Usuário Anônimo';
    const clientUserRef = doc(db, 'users', clientId);
    const clientUserSnap = await getDoc(clientUserRef);
    if (clientUserSnap.exists()) {
        clientName = (clientUserSnap.data() as UserProfile).name;
    } else {
        const clientProviderRef = doc(db, 'providers', clientId);
        const clientProviderSnap = await getDoc(clientProviderRef);
        if (clientProviderSnap.exists()) {
            clientName = (clientProviderSnap.data() as Provider).name;
        } else {
             return { success: false, error: 'Perfil de usuário não encontrado.' };
        }
    }

    await addDoc(collection(db, 'services'), {
      clientId,
      clientName, // Use the secure name
      title,
      description,
      category,
      budget,
      status: 'open',
      createdAt: Date.now(),
    });
    
    revalidatePath('/services');
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, error: 'Falha ao criar o serviço.' };
  }
  
  return { success: true };
}


const createProposalSchema = z.object({
    amount: z.coerce.number().positive('O valor da proposta deve ser positivo.'),
    message: z.string().min(10, 'A mensagem deve ter no mínimo 10 caracteres.'),
});

export async function createProposal(serviceId: string, formData: FormData) {
    if (!areCredsAvailable || !db) {
        return { success: false, error: 'O serviço de banco de dados não está disponível.' };
    }

    const providerId = await getUserIdFromToken();
    if (!providerId) {
        return { success: false, error: 'Usuário não autenticado.' };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validation = createProposalSchema.safeParse(rawData);

    if (!validation.success) {
        return { success: false, error: 'Dados da proposta inválidos.', details: validation.error.flatten() };
    }

    const { amount, message } = validation.data;

    try {
        // SECURITY: Fetch provider details from server.
        const providerRef = doc(db, 'providers', providerId);
        const providerSnap = await getDoc(providerRef);
        if (!providerSnap.exists()) {
            return { success: false, error: 'Perfil de provedor não encontrado.' };
        }
        const providerProfile = providerSnap.data() as Provider;

        const proposalsRef = collection(db, 'services', serviceId, 'proposals');
        await addDoc(proposalsRef, {
            providerId,
            providerName: providerProfile.name,
            providerAvatarUrl: providerProfile.avatarUrl,
            amount,
            message,
            createdAt: Date.now(),
            status: 'pending'
        });
        revalidatePath(`/services/${serviceId}`);
        return { success: true };
    } catch (error) {
        console.error('Error creating proposal:', error);
        return { success: false, error: 'Não foi possível enviar a proposta.' };
    }
}

const acceptProposalSchema = z.object({
    serviceId: z.string().min(1),
    proposalId: z.string().min(1),
    providerId: z.string().min(1),
});

export async function acceptProposal(data: z.infer<typeof acceptProposalSchema>) {
    if (!areCredsAvailable || !db) {
        return { success: false, error: 'Serviço de banco de dados indisponível.' };
    }
    
    const clientId = await getUserIdFromToken();
    if (!clientId) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const validation = acceptProposalSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados inválidos para aceitar proposta.' };
    }

    const { serviceId, proposalId, providerId } = validation.data;
    
    const serviceRef = doc(db, 'services', serviceId);
    const proposalRef = doc(db, 'services', serviceId, 'proposals', proposalId);
    const providerRef = doc(db, 'providers', providerId);

    try {
        await runTransaction(db, async (transaction) => {
            const serviceDoc = await transaction.get(serviceRef);
            const proposalDoc = await transaction.get(proposalRef);
            const providerDoc = await transaction.get(providerRef);

            if (!serviceDoc.exists() || !proposalDoc.exists() || !providerDoc.exists()) {
                throw new Error('Serviço, proposta ou profissional não encontrado.');
            }
            if (serviceDoc.data().clientId !== clientId) {
                throw new Error('Acesso negado. Você não é o dono deste serviço.');
            }
            if (serviceDoc.data().status !== 'open') {
                throw new Error('Este serviço não está mais aberto para propostas.');
            }

            // Update Service
            transaction.update(serviceRef, {
                status: 'in_progress',
                assignedProviderId: providerId,
                acceptedProposalId: proposalId,
                acceptedProposalAmount: proposalDoc.data().amount,
            });

            // Update Provider Status
            transaction.update(providerRef, {
                status: 'Em Serviço',
            });
            
            // Update Proposal Status
            transaction.update(proposalRef, {
                status: 'accepted'
            });
        });

        revalidatePath(`/services/${serviceId}`);
        revalidatePath(`/providers/${providerId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error accepting proposal:', error);
        return { success: false, error: error.message || 'Ocorreu um erro ao aceitar a proposta.' };
    }
}
