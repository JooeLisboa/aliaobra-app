
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AppUser, Provider, UserProfile, StripeSubscription } from '@/lib/types';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setIsLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profileData: Provider | UserProfile | undefined = undefined;
        const providerRef = doc(db, 'providers', firebaseUser.uid);
        const providerSnap = await getDoc(providerRef);

        if (providerSnap.exists()) {
          profileData = { id: providerSnap.id, ...providerSnap.data() } as Provider;
        } else {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            profileData = {uid: userSnap.id, ...userSnap.data()} as UserProfile;
          }
        }
        
        const subscriptionsRef = collection(db, 'customers', firebaseUser.uid, 'subscriptions');
        const q = query(subscriptionsRef, where("status", "in", ["trialing", "active"]));
        
        const unsubscribeSub = onSnapshot(q, (snapshot) => {
            const subscriptionData = snapshot.docs.length > 0 
                ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as StripeSubscription
                : null;

            setUser({ 
                ...firebaseUser, 
                profile: profileData,
                subscription: subscriptionData,
            });
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching subscription:", error);
            setUser({ ...firebaseUser, profile: profileData, subscription: null });
            setIsLoading(false);
        });
        
        return () => unsubscribeSub();

      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, isLoading };
}
