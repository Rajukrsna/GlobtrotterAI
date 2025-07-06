

import { TravelPlan } from '../types';
import axios from 'axios';

export const generateItinerary = async (
  destinationId: string,
  budget: number
): Promise<TravelPlan> => {
  try {
    const response = await axios.get(`http://localhost:3000/itinerary/${destinationId}`);
    const travelPlan: TravelPlan = response.data;
    console.log(budget)
  

    return travelPlan;
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    
    // Optionally, return a fallback or throw the error
    const fallbackResponse = await axios.get(`http://localhost:3000/itinerary/swiss-alps`);
    return fallbackResponse.data;
  }
};
