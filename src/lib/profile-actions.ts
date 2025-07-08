
'use server';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, areCredsAvailable, storage } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { PortfolioItem } from '@/lib/types';

// Schema for the profile details part
const profileDetailsSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório.'),
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  category: z.string().min(3, 'A categoria deve ter pelo menos 3 caracteres.'),
  location: z.string().min(2, 'A localização deve ter pelo menos 2 caracteres.'),
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres.').max(500, 'A biografia não pode ter mais de 500 caracteres.'),
  skills: z.string().optional(),
});

export async function updateProfileDetails(formData: FormData) {
  if (!areCredsAvailable || !db || !storage) {
    return { success: false, error: 'O serviço de banco de dados ou armazenamento não está disponível.' };
  }

  try {
    const rawData = Object.fromEntries(formData.entries());
    const validation = profileDetailsSchema.safeParse(rawData);
    if (!validation.success) {
      console.error('Validation errors:', validation.error.flatten());
      return { success: false, error: 'Dados inválidos. Verifique os campos de informações básicas.' };
    }
    
    const { userId, skills, ...updateData } = validation.data;
    
    const providerRef = doc(db, 'providers', userId);
    const docSnap = await getDoc(providerRef);
    if (!docSnap.exists()) {
        return { success: false, error: "Perfil não encontrado. Não é possível atualizar." };
    }

    const avatarFile = formData.get('avatar') as File | null;
    let avatarUrl: string | undefined = undefined;

    if (avatarFile && avatarFile.size > 0) {
      const avatarRef = ref(storage, `profile-pictures/${userId}/avatar`);
      const buffer = await avatarFile.arrayBuffer();
      await uploadBytes(avatarRef, buffer, { contentType: avatarFile.type });
      avatarUrl = await getDownloadURL(avatarRef);
    }
    
    const skillsArray = skills ? skills.split('\n').map(s => s.trim()).filter(Boolean) : [];
    
    const firestoreUpdateData: { [key: string]: any } = {
      ...updateData,
      skills: skillsArray,
    };
    
    if (avatarUrl) {
      firestoreUpdateData.avatarUrl = avatarUrl;
    }

    await updateDoc(providerRef, firestoreUpdateData);

    revalidatePath(`/providers/${userId}`);
    revalidatePath(`/profile/edit`);

    return { success: true };
  } catch (e: any) {
    console.error("Error updating profile details:", e);
    return { success: false, error: `Falha ao salvar as informações do perfil: ${e.message}` };
  }
}

// Schema for the portfolio part
const portfolioSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório.'),
  existingPortfolio: z.string().transform((str) => JSON.parse(str) as PortfolioItem[]),
});

export async function updateProfilePortfolio(formData: FormData) {
    if (!areCredsAvailable || !db || !storage) {
        return { success: false, error: 'O serviço de banco de dados ou armazenamento não está disponível.' };
    }

    try {
        const rawData = Object.fromEntries(formData.entries());
        const validation = portfolioSchema.safeParse(rawData);
        if (!validation.success) {
            console.error('Portfolio validation errors:', validation.error.flatten());
            return { success: false, error: 'Dados do portfólio inválidos.' };
        }

        const { userId, existingPortfolio } = validation.data;
        
        const providerRef = doc(db, 'providers', userId);
        const docSnap = await getDoc(providerRef);
        if (!docSnap.exists()) {
            return { success: false, error: "Perfil não encontrado. Não é possível atualizar." };
        }

        const newPortfolioFiles: { file: File, description: string, hint: string, index: string }[] = [];
        
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('new_portfolio_image_')) {
                const index = key.substring('new_portfolio_image_'.length);
                const file = value as File;
                const description = formData.get(`new_portfolio_desc_${index}`) as string;
                const hint = formData.get(`new_portfolio_hint_${index}`) as string;
                if (file && description && hint) {
                    newPortfolioFiles.push({ file, description, hint, index });
                }
            }
        }

        const totalPortfolioItems = existingPortfolio.length + newPortfolioFiles.length;
        if (totalPortfolioItems < 2) {
          return { success: false, error: 'São necessárias no mínimo 2 fotos no portfólio.' };
        }

        const uploadedPortfolioItems: PortfolioItem[] = [];
        for (const item of newPortfolioFiles) {
            const portfolioImageRef = ref(storage, `portfolio-images/${userId}/${Date.now()}_${item.file.name}`);
            const buffer = await item.file.arrayBuffer();
            await uploadBytes(portfolioImageRef, buffer, { contentType: item.file.type });
            const imageUrl = await getDownloadURL(portfolioImageRef);
            uploadedPortfolioItems.push({
                id: `item_${Date.now()}_${item.index}`,
                imageUrl,
                description: item.description,
                'data-ai-hint': item.hint,
            });
        }

        const finalPortfolio = [...existingPortfolio, ...uploadedPortfolioItems];

        await updateDoc(providerRef, { portfolio: finalPortfolio });

        revalidatePath(`/providers/${userId}`);
        revalidatePath(`/profile/edit`);

        return { success: true };

    } catch (e: any) {
        console.error("Error updating profile portfolio:", e);
        return { success: false, error: `Falha ao salvar o portfólio: ${e.message}` };
    }
}
