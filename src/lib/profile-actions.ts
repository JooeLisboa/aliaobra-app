'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Provider } from '@/lib/types';

const profileSchema = z.object({
  providerId: z.string(),
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  avatarUrl: z.string().url('Por favor, insira uma URL válida para o avatar.'),
  category: z.string().min(3, 'A categoria deve ter pelo menos 3 caracteres.'),
  location: z.string().min(2, 'A localização deve ter pelo menos 2 caracteres.'),
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres.'),
  skills: z.string(),
  portfolio: z.array(z.object({
    id: z.string(),
    imageUrl: z.string().url(),
    description: z.string().min(1, 'A descrição não pode estar vazia.'),
    'data-ai-hint': z.string().min(1, 'A dica para IA não pode estar vazia.'),
  })),
});

export async function updateUserProfile(data: z.infer<typeof profileSchema>) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const validation = profileSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Dados inválidos. Verifique todos os campos.' };
  }

  const { providerId, skills, ...updateData } = validation.data;
  const providerRef = doc(db, 'providers', providerId);

  try {
    const skillsArray = skills.split('\n').map(s => s.trim()).filter(Boolean);

    await updateDoc(providerRef, {
      ...updateData,
      skills: skillsArray,
    });

    revalidatePath(`/providers/${providerId}`);
    revalidatePath(`/profile/edit`);

    return { success: true };
  } catch (e: any) {
    console.error("Error updating user profile:", e);
    return { success: false, error: 'Falha ao salvar o perfil no banco de dados.' };
  }
}
