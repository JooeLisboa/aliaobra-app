'use server';

import { doc, setDoc } from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import type { Provider } from '@/lib/types';

type UserProfileData = {
  uid: string;
  email: string;
  fullName: string;
  cpfCnpj: string;
  userType: 'client' | 'provider' | 'agency';
};

export async function createUserProfile(data: UserProfileData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'A configuração do Firebase está incompleta. Contate o suporte.' };
  }
  try {
    // If they are a provider or agency, create a profile in the 'providers' collection
    if (data.userType === 'provider' || data.userType === 'agency') {
       const providerDocRef = doc(db, 'providers', data.uid);
       
       // Create a default provider profile by casting a partial object to Provider
       const newProvider: Provider = {
           id: data.uid,
           name: data.fullName,
           category: 'Não especificada',
           location: 'Não informada',
           avatarUrl: `https://placehold.co/100x100.png`,
           rating: 0,
           reviewCount: 0,
           bio: `Perfil de ${data.fullName}.`,
           skills: [],
           status: 'Disponível',
           portfolio: [],
           reviews: [],
           type: data.userType === 'provider' ? 'individual' : 'agency',
       };

       await setDoc(providerDocRef, newProvider);
    } else {
      // For clients, create a document in a 'users' collection
      const userDocRef = doc(db, 'users', data.uid);
      await setDoc(userDocRef, {
        uid: data.uid,
        email: data.email,
        name: data.fullName,
        cpfCnpj: data.cpfCnpj,
        userType: data.userType,
        createdAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating user profile in Firestore: ", error);
    return { success: false, error: 'Não foi possível criar o perfil no banco de dados.' };
  }
}
