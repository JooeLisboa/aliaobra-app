"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AppUser, Provider, UserProfile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, let's fetch their profile.
        const providerRef = doc(db, 'providers', firebaseUser.uid);
        const providerSnap = await getDoc(providerRef);

        let profileData: Provider | UserProfile | undefined = undefined;

        if (providerSnap.exists()) {
          profileData = { id: providerSnap.id, ...providerSnap.data() } as Provider;
        } else {
          // If not a provider, check if they are a client
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            profileData = {uid: userSnap.id, ...userSnap.data()} as UserProfile;
          }
        }
        
        setUser({ ...firebaseUser, profile: profileData });

      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}
