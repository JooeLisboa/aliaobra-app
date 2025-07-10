
'use server';

import { doc, setDoc } from 'firebase/firestore';
import { db, areCredsAvailable, getFirebaseAdmin } from '@/lib/firebase';
import type { Provider, UserProfile } from '@/lib/types';
import { z } from 'zod';

const userProfileSchema = z.object({
  uid: z.string().min(1, "UID is required."),
  email: z.string().email("Invalid email format."),
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  cpfCnpj: z.string().min(11, "CPF/CNPJ is required."),
  userType: z.enum(['client', 'provider', 'agency']),
  plan: z.string().optional(),
});

export async function createUserProfile(data: z.infer<typeof userProfileSchema>) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'A configuração do Firebase está incompleta. Contate o suporte.' };
  }
  
  const validation = userProfileSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Validation failed: " + validation.error.flatten().fieldErrors };
  }
  
  const { uid, email, fullName, cpfCnpj, userType, plan } = validation.data;

  try {
    const { auth } = getFirebaseAdmin();
    // Use Firebase Admin to set a custom claim. This is more secure than relying on a userType field in Firestore.
    await auth.setCustomUserClaims(uid, { userType, plan: plan || 'básico' });

    // If they are a provider or agency, create a profile in the 'providers' collection
    if (userType === 'provider' || userType === 'agency') {
       const providerDocRef = doc(db, 'providers', uid);
       
       const planName = plan || 'básico';

       const newProvider: Omit<Provider, 'id'> = {
           name: fullName,
           category: 'Não especificada',
           location: 'Não informada',
           avatarUrl: `https://placehold.co/100x100.png`,
           rating: 0,
           reviewCount: 0,
           bio: `Perfil de ${fullName}.`,
           skills: [],
           status: 'Disponível',
           portfolio: [],
           reviews: [],
           isVerified: false,
           type: userType === 'provider' ? 'individual' : 'agency',
           plan: planName as Provider['plan'],
       };

       await setDoc(providerDocRef, newProvider);
    } else {
      // For clients, create a document in a 'users' collection
      const userDocRef = doc(db, 'users', uid);
      const newClientProfile: Omit<UserProfile, 'uid'> = {
        email: email,
        name: fullName,
        cpfCnpj: cpfCnpj,
        userType: userType,
        createdAt: new Date(),
      };
      await setDoc(userDocRef, newClientProfile);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error creating user profile: ", error);
    return { success: false, error: `Não foi possível criar o perfil no banco de dados: ${error.message}` };
  }
}
