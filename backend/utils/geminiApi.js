import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
// Automatically uses GEMINI_API_KEY

console.log('Gemini API initialized with key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');

/**
 * Parse user interests from their input message
 */
export async function parseUserInterests(userMessage) {
  try {
    const prompt = `
    Analyze the following travel preference message and extract structured information:
    
    User Message: "${userMessage}"
    
    Return a valid JSON object like:
    {
      "interests": [...],
      "preferences": {
        "cultural": [...],
        "food": [...],
        "activities": [...],
        "atmosphere": [...]
      },
      "keywords": [...],
      "travelStyle": "budget|mid-range|luxury",
      "duration": "number of days (default 5)"
    }

    Examples:
    - "I love BTS, Studio Ghibli, and ramen" → interests: ["BTS", "Studio Ghibli", "ramen"], cultural: ["K-pop", "anime"], food: ["Japanese cuisine", "ramen"]
    Return only valid JSON, no extra text.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;
    const cleanedText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error('Error parsing user interests:', error);
    return {
      interests: [userMessage],
      preferences: {
        cultural: [],
        food: [],
        activities: [],
        atmosphere: []
      },
      keywords: userMessage.split(' ').filter(w => w.length > 3),
      travelStyle: "mid-range",
      duration: "5"
    };
  }
}

/**
 * Generate a complete travel itinerary using RAG
 */
export async function generateItineraryWithRAG(userInterests, qlooRecommendations, budget = 2500) {
  try {
    const prompt = `
Create a detailed travel itinerary based on the user's interests and taste-aligned recommendations.

User Interests: ${JSON.stringify(userInterests)}
Budget: $${budget}
Qloo Recommendations: ${JSON.stringify(qlooRecommendations)}

Generate a JSON object:
{
  "id": "unique-trip-id",
  "destination": "City, Country",
  "duration": ${userInterests.duration || 5},
  "mapCenter": {"lat": number, "lng": number},
  "preferences": [...],
  "costBreakdown": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number,
    "total": number
  },
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "totalCost": number,
      "activities": [
        {
          "id": "activity-id",
          "time": "HH:MM AM/PM",
          "title": "...",
          "description": "...",
          "location": "...",
          "coordinates": {"lat": number, "lng": number},
          "cost": number,
          "type": "...",
          "rating": 1-5
        }
      ]
    }
  ]
}

Guidelines:
- Use realistic cities and coordinates.
- Stay within budget.
- Add 6-8 activities per day (morning, afternoon, evening).
- Make it personal by referencing user preferences.
- Use tomorrow's date as start.
- Return only valid JSON.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = result.text;
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const travelPlan = JSON.parse(cleaned);

    if (!travelPlan.id) travelPlan.id = `trip-${Date.now()}`;
    if (!travelPlan.mapCenter) travelPlan.mapCenter = { lat: 35.6762, lng: 139.6503 };
    console.log('Generated travel plan:', travelPlan);
    return travelPlan;

  } catch (error) {
    console.error('Error generating itinerary with Gemini:', error);
    throw new Error('Failed to generate travel itinerary');
  }
}

/**
 * Get travel suggestions based on user query
 */
export async function getTravelSuggestions(userMessage) {
  try {
    const prompt = `
Based on this query: "${userMessage}"
Suggest 3-5 destinations. Return JSON like:
[
  {
    "id": "slug-id",
    "name": "City Name",
    "country": "Country",
    "description": "...",
    "image": "https://images.pexels.com/photos/XXXX.jpg",
    "highlights": [...],
    "estimatedCost": number,
    "duration": "5-7 days",
    "coordinates": {"lat": number, "lng": number},
    "matchScore": 70-95
  }
]

Use real cities, realistic data. Return only valid JSON.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-pro",
      contents: prompt,
    });

    const text = result.text;
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error('Error getting travel suggestions:', error);
    return [];
  }
}
