'use server';

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
  orderBy,
} from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import type { Chat, Provider, UserProfile } from '@/lib/types';
import { getProvider } from './data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebaseAdmin } from './firebase-admin';
import { headers } from 'next/headers';

const startChatSchema = z.object({
  providerId: z.string(),
  initialMessage: z.string().min(1, "A mensagem não pode estar vazia.").max(500, "A mensagem é muito longa."),
});

const sendMessageSchema = z.object({
  chatId: z.string(),
  messageText: z.string().min(1, "A mensagem não pode estar vazia.").max(500, "A mensagem é muito longa."),
});

// Helper function to decode the Firebase auth token from headers
async function getUserIdFromToken() {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }
    const token = authorization.split('Bearer ')[1];
    if (!token) return null;

    try {
        const { auth } = getFirebaseAdmin();
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying auth token:", error);
        return null;
    }
}

function getChatId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_');
}

export async function startChat(formData: FormData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const clientId = await getUserIdFromToken();
  if (!clientId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = startChatSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.', details: validation.error.flatten() };
  }

  const { providerId, initialMessage } = validation.data;
  
  if (providerId === clientId) {
    return { success: false, error: 'Você não pode iniciar uma conversa consigo mesmo.' };
  }

  const chatId = getChatId(clientId, providerId);
  const chatRef = doc(db, 'chats', chatId);

  try {
    const batch = writeBatch(db);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      const provider = await getProvider(providerId);
      if (!provider) {
        return { success: false, error: 'Provedor não encontrado.' };
      }

      let clientProfile: { name: string, avatarUrl: string } | null = null;
      const providerAsClientSnap = await getDoc(doc(db, 'providers', clientId));
      if (providerAsClientSnap.exists()) {
          const data = providerAsClientSnap.data() as Provider;
          clientProfile = { name: data.name, avatarUrl: data.avatarUrl };
      } else {
          const userSnap = await getDoc(doc(db, 'users', clientId));
          if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              clientProfile = { name: data.name, avatarUrl: `https://placehold.co/100x100.png` };
          }
      }

      if (!clientProfile) {
          return { success: false, error: 'Perfil do cliente não encontrado.' };
      }

      const newChatData: Omit<Chat, 'id'> = {
        participantIds: [clientId, providerId],
        participantInfo: {
          [clientId]: { name: clientProfile.name, avatarUrl: clientProfile.avatarUrl },
          [providerId]: { name: provider.name, avatarUrl: provider.avatarUrl },
        },
        updatedAt: Date.now(),
      };
      batch.set(chatRef, newChatData);
    }
    
    const messagesCollectionRef = collection(chatRef, 'messages');
    const newMessage = {
      senderId: clientId,
      text: initialMessage,
      timestamp: serverTimestamp(),
    };
    batch.set(doc(messagesCollectionRef), newMessage);

    batch.set(chatRef, {
        lastMessage: { text: initialMessage, senderId: clientId, timestamp: Date.now() },
        updatedAt: Date.now(),
    }, { merge: true });

    await batch.commit();
    revalidatePath(`/chat`);
    
    return { success: true, chatId };
  } catch (error) {
    console.error('Error starting chat:', error);
    return { success: false, error: 'Falha ao iniciar conversa.' };
  }
}

export async function sendMessageInChat(formData: FormData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const senderId = await getUserIdFromToken();
  if (!senderId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  const validation = sendMessageSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validation.success) {
    return { success: false, error: 'Dados da mensagem são inválidos.' };
  }
  
  const { chatId, messageText } = validation.data;
  const chatRef = doc(db, 'chats', chatId);
  
  try {
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists() || !chatDoc.data().participantIds?.includes(senderId)) {
        return { success: false, error: 'Acesso negado. Você não faz parte desta conversa.' };
    }

    const batch = writeBatch(db);
    const messagesCollectionRef = collection(chatRef, 'messages');

    const newMessage = {
      senderId: senderId,
      text: messageText,
      timestamp: serverTimestamp(),
    };
    batch.set(doc(messagesCollectionRef), newMessage);

    batch.set(chatRef, {
        lastMessage: { text: messageText, senderId: senderId, timestamp: Date.now() },
        updatedAt: Date.now(),
    }, { merge: true });

    await batch.commit();
    revalidatePath(`/chat/${chatId}`);

    return { success: true };
  } catch(e) {
    console.error('Error sending message in chat:', e);
    return { success: false, error: 'Falha ao enviar mensagem.' };
  }
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  if (!areCredsAvailable || !db) return [];
  
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(chatsQuery);
  const chats = querySnapshot.docs.map(doc => {
      const data = doc.data();
      if (data.lastMessage && data.lastMessage.timestamp instanceof Timestamp) {
        data.lastMessage.timestamp = data.lastMessage.timestamp.toMillis();
      }
      data.updatedAt = (data.updatedAt instanceof Timestamp) ? data.updatedAt.toMillis() : (data.updatedAt || 0);

      return { id: doc.id, ...data } as Chat
  });
  
  return chats;
}
