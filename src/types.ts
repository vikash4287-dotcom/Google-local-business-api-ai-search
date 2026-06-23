export interface Business {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  city: string;
}

export interface SavedBusiness extends Business {
  savedAt: string;
  status?: 'New' | 'Contacted' | 'Interested' | 'Do Not Contact';
}

export interface SearchHistory {
  id: string;
  city: string;
  category: string;
  timestamp: string;
  resultsCount: number;
  filters: {
    minRating: number;
    maxRating: number;
    minReviews: number;
    maxReviews: number;
    hasWebsite: 'any' | 'yes' | 'no';
  };
}

export interface ActiveUser {
  id: string;
  email: string;
  createdAt: string;
}
