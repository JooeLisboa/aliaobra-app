export type Review = {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment: string;
  imageUrl?: string;
  date: string;
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
  availability: string;
  portfolio: {
    id: string;
    imageUrl: string;
    description: string;
  }[];
  reviews: Review[];
};
