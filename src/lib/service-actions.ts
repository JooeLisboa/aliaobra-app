'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const createServiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required.'),
  clientName: z.string().min(1, 'Client name is required.'),
  title: z.string().min(5, 'O título deve ter no mínimo 5 caracteres.').max(100, 'O título é muito longo.'),
  description: z.string().min(20, 'A descrição deve ter no mínimo 20 caracteres.').max(2000, 'A descrição é muito longa.'),
  category: z.string().min(3, 'A categoria é obrigatória.'),
  budget: z.coerce.number().positive('O orçamento deve ser um número positivo.'),
});

export async function createService(formData: FormData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = createServiceSchema.safeParse(rawData);

  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Dados inválidos.', details: validation.error.flatten().fieldErrors };
  }

  const { clientId, clientName, title, description, category, budget } = validation.data;
  let serviceId: string | null = null;

  try {
    const docRef = await addDoc(collection(db, 'services'), {
      clientId,
      clientName,
      title,
      description,
      category,
      budget,
      status: 'open',
      createdAt: Date.now(),
      proposals: [],
    });
    
    serviceId = docRef.id;
    revalidatePath('/services');
    revalidatePath(`/services/${serviceId}`);

  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, error: 'Falha ao criar o serviço.' };
  }
  
  if (serviceId) {
    redirect(`/services/${serviceId}`);
  } else {
    redirect('/services');
  }
}
