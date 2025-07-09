
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { DocumentReference } from 'firebase/firestore';

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
  plan: 'Básico' | 'Profissional' | 'Agência';
  // For agencies
  managedProviderIds?: string[];
  // For individuals belonging to an agency
  agency?: {
    id: string;
    name: string;
  };
};

export type StripePrice = {
  id: string;
  active: boolean;
  currency: string;
  description: string | null;
  type: 'one_time' | 'recurring';
  unit_amount: number | null;
  interval?: 'day' | 'week' | 'month' | 'year';
  [key: string]: any;
};

export type StripeProduct = {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  images: string[];
  prices: StripePrice[];
  metadata?: {
    isFeatured?: string;
    features?: string;
    [key: string]: any;
  }
  [key:string]: any;
};

export type StripeSubscription = {
  id: string;
  status: 'active' | 'trialing' | 'incomplete' | 'past_due' | 'canceled' | 'unpaid';
  product: DocumentReference<StripeProduct>;
  [key: string]: any;
};

export type AppUser = FirebaseAuthUser & {
  profile?: Provider | UserProfile;
  subscription?: StripeSubscription | null;
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

export type Proposal = {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatarUrl: string;
  amount: number;
  message: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
};

export type Service = {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  assignedProviderId?: string;
  acceptedProposalId?: string;
  acceptedProposalAmount?: number;
};
