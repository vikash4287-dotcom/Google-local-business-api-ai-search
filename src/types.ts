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
  latitude?: number;
  longitude?: number;
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

export interface WebsiteAudit {
  id: string;
  businessId: string;
  businessName: string;
  website: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendedImprovements: string[];
  potentialServicesToSell: string[];
  estimatedProjectValue: string;
  auditedAt: string;
}

export interface Proposal {
  id: string;
  businessId: string;
  businessName: string;
  website: string;
  executiveSummary: string;
  businessProblems: string[];
  websiteIssues: string[];
  reviewAndReputationIssues: string[];
  recommendedServices: string[];
  expectedResults: string[];
  pricingRecommendations: string;
  timeline: string;
  nextSteps: string[];
  generatedAt: string;
}

export interface ServicePackage {
  name: string;
  services: string[];
  estimatedPricing: string;
  expectedOutcomes: string[];
}

export interface ServicePackagesDraft {
  id: string;
  businessId: string;
  businessName: string;
  starter: ServicePackage;
  professional: ServicePackage;
  premium: ServicePackage;
  recommendedPackage: string;
  generatedAt: string;
}

export interface OutreachTemplate {
  subject?: string;
  body: string;
}

export interface OutreachToolkit {
  id: string;
  businessId: string;
  businessName: string;
  coldEmail: OutreachTemplate;
  linkedInMessage: OutreachTemplate;
  whatsAppMessage: OutreachTemplate;
  followUpEmail: OutreachTemplate;
  salesPitch: OutreachTemplate;
  generatedAt: string;
}

export type SubscriptionTier = 'Free' | 'Starter' | 'Agency';

export interface UserSubscription {
  tier: SubscriptionTier;
  searchesToday: number;
  lastSearchDate: string; // YYYY-MM-DD
}




