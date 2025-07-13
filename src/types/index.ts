export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  cost: number;
  type: 'attraction' | 'restaurant' | 'transport' | 'accommodation';
  rating?: number;
}

export interface CostBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  total: number;
}

export interface TravelPlan {
  id: string;
  destination: string;
  duration: number;
  itinerary: ItineraryDay[];
  costBreakdown: CostBreakdown;
  mapCenter: { lat: number; lng: number };
  preferences: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  highlights: string[];
  estimatedCost: number;
  duration: string;
  coordinates: { lat: number; lng: number };
  matchScore: number;
}

export interface ConversationState {
  step: 'initial' | 'budget' | 'generating' | 'itinerary';
  travelWish?: string;
  budget?: number;
  userLocation?: { lat: number; lng: number };
}

// Google Maps types
declare global {
  interface Window {
    google: any;
  }
}