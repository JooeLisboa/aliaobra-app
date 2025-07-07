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
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, areCredsAvailable } from '@/lib/firebase';
import type { Chat } from '@/lib/types';
import { getProvider } from './data';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const startChatSchema = z.object({
  providerId: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  clientAvatar: z.string().url(),
  initialMessage: z.string().min(1, "A mensagem não pode estar vazia."),
});

const sendMessageSchema = z.object({
  chatId: z.string(),
  senderId: z.string(),
  messageText: z.string().min(1, "A mensagem não pode estar vazia."),
});

function getChatId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_');
}

export async function startChat(formData: FormData) {
  if (!areCredsAvailable || !db) {
    return { success: false, error: 'O serviço de banco de dados não está disponível.' };
  }

  const rawData = {
    providerId: formData.get('providerId'),
    clientId: formData.get('clientId'),
    clientName: formData.get('clientName'),
    clientAvatar: formData.get('clientAvatar'),
    initialMessage: formData.get('initialMessage'),
  };

  const validation = startChatSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.', details: validation.error.flatten() };
  }

  const { providerId, clientId, clientName, clientAvatar, initialMessage } = validation.data;
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
      const newChatData: Omit<Chat, 'id'> = {
        participantIds: [clientId, providerId],
        participantInfo: {
          [clientId]: { name: clientName, avatarUrl: clientAvatar },
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

  const validation = sendMessageSchema.safeParse({
    chatId: formData.get('chatId'),
    senderId: formData.get('senderId'),
    messageText: formData.get('messageText'),
  });

  if (!validation.success) {
    return { success: false, error: 'Dados da mensagem são inválidos.' };
  }
  
  const { chatId, senderId, messageText } = validation.data;
  const chatRef = doc(db, 'chats', chatId);
  const messagesCollectionRef = collection(chatRef, 'messages');

  try {
    const batch = writeBatch(db);

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
