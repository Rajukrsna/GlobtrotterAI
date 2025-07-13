import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Parse user interests from their input message
 * @param {string} userMessage - The user's travel preferences message
 * @returns {Promise<Object>} Parsed interests and preferences
 */
export async function parseUserInterests(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Analyze the following travel preference message and extract structured information:
    
    User Message: "${userMessage}"
    
    Please extract and return a JSON object with the following structure:
    {
      "interests": ["list of specific interests/hobbies mentioned"],
      "preferences": {
        "cultural": ["cultural preferences like music, movies, art"],
        "food": ["food preferences mentioned"],
        "activities": ["activity types they might enjoy"],
        "atmosphere": ["preferred atmosphere/vibe"]
      },
      "keywords": ["key search terms for recommendations"],
      "travelStyle": "budget|mid-range|luxury",
      "duration": "estimated trip duration in days (default 5 if not specified)"
    }
    
    Examples:
    - "I love BTS, Studio Ghibli, and ramen" → interests: ["BTS", "Studio Ghibli", "ramen"], cultural: ["K-pop", "anime"], food: ["Japanese cuisine", "ramen"]
    - "I'm into hiking, craft beer, and indie music" → interests: ["hiking", "craft beer", "indie music"], activities: ["outdoor activities", "hiking"], food: ["craft beer"]
    
    Return only valid JSON, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
    
  } catch (error) {
    console.error('Error parsing user interests with Gemini:', error);
    // Fallback parsing
    return {
      interests: [userMessage],
      preferences: {
        cultural: [],
        food: [],
        activities: [],
        atmosphere: []
      },
      keywords: userMessage.split(' ').filter(word => word.length > 3),
      travelStyle: "mid-range",
      duration: "5"
    };
  }
}

/**
 * Generate a complete travel itinerary using RAG
 * @param {Object} userInterests - Parsed user interests
 * @param {Array} qlooRecommendations - Recommendations from Qloo API
 * @param {number} budget - User's budget
 * @returns {Promise<Object>} Complete travel plan
 */
export async function generateItineraryWithRAG(userInterests, qlooRecommendations, budget = 2500) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Create a detailed travel itinerary based on the user's interests and taste-aligned recommendations.
    
    User Interests: ${JSON.stringify(userInterests)}
    Budget: $${budget}
    Qloo Recommendations: ${JSON.stringify(qlooRecommendations)}
    
    Generate a complete travel plan in the following JSON structure:
    {
      "id": "unique-trip-id",
      "destination": "Primary destination city, Country",
      "duration": ${userInterests.duration || 5},
      "mapCenter": {"lat": latitude, "lng": longitude},
      "preferences": ["list of user preferences"],
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
              "id": "unique-activity-id",
              "time": "HH:MM AM/PM",
              "title": "Activity Name",
              "description": "Detailed description connecting to user interests",
              "location": "Specific address or area",
              "coordinates": {"lat": number, "lng": number},
              "cost": number,
              "type": "attraction|restaurant|transport|accommodation",
              "rating": number (1-5)
            }
          ]
        }
      ]
    }
    
    Guidelines:
    1. Choose the BEST destination from Qloo recommendations that matches user interests
    2. Create 6-8 activities per day, mixing attractions, restaurants, and experiences
    3. Ensure activities align with user's cultural interests and preferences
    4. Include specific restaurants/venues from Qloo recommendations when possible
    5. Provide realistic coordinates for a major city
    6. Keep total cost within budget
    7. Start dates from tomorrow
    8. Include morning, afternoon, and evening activities
    9. Add transport between major location changes
    10. Make descriptions personal and engaging, referencing user interests
    
    Return only valid JSON, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const travelPlan = JSON.parse(cleanedText);
    
    // Ensure required fields and validate structure
    if (!travelPlan.id) travelPlan.id = `trip-${Date.now()}`;
    if (!travelPlan.mapCenter) travelPlan.mapCenter = { lat: 35.6762, lng: 139.6503 }; // Default to Tokyo
    
    return travelPlan;
    
  } catch (error) {
    console.error('Error generating itinerary with Gemini:', error);
    throw new Error('Failed to generate travel itinerary');
  }
}

/**
 * Get travel suggestions based on user query
 * @param {string} userMessage - User's travel query
 * @returns {Promise<Array>} Suggested destinations with match scores
 */
export async function getTravelSuggestions(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Based on this travel query: "${userMessage}"
    
    Suggest 3-5 destinations that would perfectly match these interests. Return as JSON array:
    [
      {
        "id": "destination-slug",
        "name": "City Name",
        "country": "Country",
        "description": "Why this destination matches their interests",
        "image": "https://images.pexels.com/photos/relevant-photo-id/pexels-photo-id.jpeg",
        "highlights": ["highlight1", "highlight2", "highlight3"],
        "estimatedCost": number,
        "duration": "5-7 days",
        "coordinates": {"lat": number, "lng": number},
        "matchScore": number (70-95)
      }
    ]
    
    Make sure to use real Pexels image URLs and provide accurate coordinates.
    Return only valid JSON array, no additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
    
  } catch (error) {
    console.error('Error getting travel suggestions:', error);
    return [];
  }
}