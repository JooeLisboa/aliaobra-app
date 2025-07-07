import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Provider } from './types';

export async function getProviders(): Promise<Provider[]> {
  // Note: You need to have a 'providers' collection in your Firestore database.
  try {
    const providersCollection = collection(db, 'providers');
    const providerSnapshot = await getDocs(providersCollection);
    const providerList = providerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
    return providerList;
  } catch (error) {
    console.error("Error fetching providers: ", error);
    // In a real app, you'd want to handle this more gracefully
    return [];
  }
}

export async function getProvider(id: string): Promise<Provider | null> {
    try {
        const providerRef = doc(db, 'providers', id);
        const providerSnap = await getDoc(providerRef);

        if (providerSnap.exists()) {
            return { id: providerSnap.id, ...providerSnap.data() } as Provider;
        } else {
            console.warn(`Provider with id ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching provider: ", error);
        return null;
    }
}

export async function getProvidersByIds(ids: string[]): Promise<Provider[]> {
    if (!ids || ids.length === 0) {
        return [];
    }
    try {
        const providerPromises = ids.map(id => getProvider(id));
        const providers = await Promise.all(providerPromises);
        // Filter out any null results (if a provider wasn't found)
        return providers.filter((p): p is Provider => p !== null);
    } catch(error) {
        console.error("Error fetching providers by IDs: ", error);
        return [];
    }
}
