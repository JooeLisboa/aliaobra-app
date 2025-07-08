import { db, areCredsAvailable } from './firebase';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';
import type { Provider, Service, Proposal } from './types';

const planOrder: Record<string, number> = {
  'Agência': 0,
  'Profissional': 1,
  'Básico': 2,
};

export async function getProviders(): Promise<Provider[]> {
  if (!areCredsAvailable || !db) {
    return [];
  }
  try {
    const providersCollection = collection(db, 'providers');
    const providerSnapshot = await getDocs(providersCollection);
    const providerList = providerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
    
    // Sort providers to show subscribers first
    providerList.sort((a, b) => {
        const planA = a.plan || 'Básico';
        const planB = b.plan || 'Básico';
        return (planOrder[planA] ?? 99) - (planOrder[planB] ?? 99);
    });

    return providerList;
  } catch (error) {
    console.error("Error fetching providers: ", error);
    return [];
  }
}

export async function getProvider(id: string): Promise<Provider | null> {
    if (!areCredsAvailable || !db) {
        return null;
    }
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
    if (!areCredsAvailable || !db || !ids || ids.length === 0) {
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

export async function getServices(): Promise<Service[]> {
  if (!areCredsAvailable || !db) {
    return [];
  }
  try {
    const servicesCollection = collection(db, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    const serviceList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    // Sort by most recent
    return serviceList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching services: ", error);
    return [];
  }
}

export async function getService(id: string): Promise<Service | null> {
    if (!areCredsAvailable || !db) {
        return null;
    }
    try {
        const serviceRef = doc(db, 'services', id);
        const serviceSnap = await getDoc(serviceRef);

        if (serviceSnap.exists()) {
            return { id: serviceSnap.id, ...serviceSnap.data() } as Service;
        } else {
            console.warn(`Service with id ${id} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching service: ", error);
        return null;
    }
}

export async function getProposalsForService(serviceId: string): Promise<Proposal[]> {
  if (!areCredsAvailable || !db) {
    return [];
  }
  try {
    const proposalsCollection = collection(db, 'services', serviceId, 'proposals');
    const proposalSnapshot = await getDocs(proposalsCollection);
    const proposalList = proposalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
    return proposalList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching proposals: ", error);
    return [];
  }
}
