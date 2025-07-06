import { Destination } from '../types';
import axios from 'axios';
const fetchDestinations = async(): Promise<Destination[]> => {
 
  try{
    const response = await axios.get("http://localhost:3000/destination");
    console.log("Fetched destinations:", response);
    return response.data;
  }
catch
  (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }

}

export const getRecommendedDestinations = async (
  travelWish: string,
  budget: number,
  count: number = 6
): Promise<Destination[]> => {
  const keywords = travelWish.toLowerCase();

  const destinationDatabase = await fetchDestinations(); // ⬅️ Await here

  // Score destinations based on keywords and budget
  const scoredDestinations = destinationDatabase.map(dest => {
    let score = dest.matchScore;

    // Keyword matching
    if (keywords.includes('mountain') || keywords.includes('peaceful')) {
      if (dest.id === 'swiss-alps' || dest.id === 'banff') score += 20;
    }
    if (keywords.includes('beach') || keywords.includes('luxury')) {
      if (dest.id === 'maldives' || dest.id === 'santorini') score += 20;
    }
    if (keywords.includes('culture') || keywords.includes('temple')) {
      if (dest.id === 'kyoto') score += 20;
    }
    if (keywords.includes('wine') || keywords.includes('countryside')) {
      if (dest.id === 'tuscany') score += 20;
    }

    // Budget matching
    if (dest.estimatedCost <= budget) {
      score += 10;
    } else if (dest.estimatedCost > budget * 1.5) {
      score -= 20;
    }
    return { ...dest, matchScore: score };
  });

  // Sort and return top destinations
  return scoredDestinations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, count);
};
