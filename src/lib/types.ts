export type Review = {
  id: string;
  author: {
    id: string;
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
  // For agencies
  managedProviderIds?: string[];
  // For individuals belonging to an agency
  agency?: {
    id: string;
    name: string;
  };
};
