import { db, areCredsAvailable } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import type { Provider, Service, Proposal, StripeProduct, StripePrice } from './types';

const planOrder: Record<string, number> = {
  'agencia': 0,
  'profissional': 1,
  'basico': 2,
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
        
        const planRoleA = Object.keys(planOrder).find(key => planOrder[key as keyof typeof planOrder] === (a.plan ? ['Agência', 'Profissional', 'Básico'].indexOf(a.plan) : 2)) || 'basico';
        const planRoleB = Object.keys(planOrder).find(key => planOrder[key as keyof typeof planOrder] === (b.plan ? ['Agência', 'Profissional', 'Básico'].indexOf(b.plan) : 2)) || 'basico';

        return (planOrder[planRoleA] ?? 99) - (planOrder[planRoleB] ?? 99);
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

export async function getActiveProductsWithPrices(): Promise<StripeProduct[]> {
    if (!areCredsAvailable || !db) return [];

    try {
        const productsRef = collection(db, 'products');
        const productsQuery = query(productsRef, where('active', '==', true));
        const querySnapshot = await getDocs(productsQuery);
        
        const products: StripeProduct[] = [];

        for (const productDoc of querySnapshot.docs) {
            const productData = { id: productDoc.id, ...productDoc.data() } as StripeProduct;
            
            // Skip products that don't have the required metadata. This is the key check.
            if (!productData.metadata || !productData.metadata.firebaseRole) {
              continue;
            }

            const pricesRef = collection(productDoc.ref, 'prices');
            const pricesQuery = query(pricesRef, where('active', '==', true));
            const priceSnap = await getDocs(pricesQuery);

            productData.prices = priceSnap.docs.map(priceDoc => ({ id: priceDoc.id, ...priceDoc.data() } as StripePrice));
            
            if (productData.prices.length > 0) {
              products.push(productData);
            }
        }
        
        // Sort the valid products based on the order defined in `planOrder`
        products.sort((a, b) => {
            const orderA = planOrder[a.metadata.firebaseRole as keyof typeof planOrder] ?? 99;
            const orderB = planOrder[b.metadata.firebaseRole as keyof typeof planOrder] ?? 99;
            return orderA - orderB;
        });

        return products;

    } catch (error) {
        console.error("Error fetching active products with prices:", error);
        return [];
    }
}
