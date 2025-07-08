import type { User as FirebaseAuthUser } from 'firebase/auth';

export type Review = {
  id: string;
  author: {
    id:string;
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment: string;
  imageUrl?: string;
  date: string;
};

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  description: string;
  "data-ai-hint": string;
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  cpfCnpj: string;
  userType: 'client';
  createdAt: any; // Firestore timestamp
};


export type Provider = {
  id: string;
  name: string;
  category: string;
  location: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  bio: string;
  skills: string[];
  status: 'Disponível' | 'Em Serviço';
  serviceAcceptedAt?: number;
  portfolio: PortfolioItem[];
  reviews: Review[];
  type: 'individual' | 'agency';
  isVerified: boolean;
  plan?: 'Básico' | 'Profissional' | 'Agência';
  // For agencies
  managedProviderIds?: string[];
  // For individuals belonging to an agency
  agency?: {
    id: string;
    name: string;
  };
};

export type AppUser = FirebaseAuthUser & {
  profile?: Provider | UserProfile;
};


export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
};

export type Chat = {
  id: string;
  participantIds: string[];
  participantInfo: {
    [key: string]: {
      name: string;
      avatarUrl: string;
    };
  };
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  updatedAt: number;
};
