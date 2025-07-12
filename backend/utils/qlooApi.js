import axios from 'axios';

const QLOO_BASE_URL = 'https://api.qloo.com/v1';

/**
 * Get taste-aligned recommendations from Qloo API
 * @param {Object} userInterests - Parsed user interests from Gemini
 * @returns {Promise<Object>} Qloo recommendations
 */
export async function getQlooRecommendations(userInterests) {
  try {
    if (!process.env.QLOO_API_KEY) {
      console.warn('Qloo API key not found, using fallback recommendations');
      return generateFallbackRecommendations(userInterests);
    }

    const headers = {
      'Authorization': `Bearer ${process.env.QLOO_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // Prepare search terms from user interests
    const searchTerms = [
      ...userInterests.interests,
      ...userInterests.preferences.cultural,
      ...userInterests.preferences.food,
      ...userInterests.keywords
    ].filter(Boolean);

    const recommendations = {
      destinations: [],
      restaurants: [],
      attractions: [],
      experiences: []
    };

    // Get travel destination recommendations
    try {
      const destinationResponse = await axios.post(`${QLOO_BASE_URL}/recommendations`, {
        type: 'travel',
        input: {
          positive: searchTerms.slice(0, 5), // Limit to top 5 terms
          negative: []
        },
        geo: {
          country: 'global'
        },
        limit: 10
      }, { headers });

      recommendations.destinations = destinationResponse.data.results || [];
    } catch (error) {
      console.warn('Qloo travel recommendations failed:', error.message);
    }

    // Get restaurant recommendations
    try {
      const restaurantResponse = await axios.post(`${QLOO_BASE_URL}/recommendations`, {
        type: 'dining',
        input: {
          positive: [...userInterests.preferences.food, ...searchTerms].slice(0, 5),
          negative: []
        },
        limit: 15
      }, { headers });

      recommendations.restaurants = restaurantResponse.data.results || [];
    } catch (error) {
      console.warn('Qloo restaurant recommendations failed:', error.message);
    }

    // Get cultural/entertainment recommendations
    try {
      const cultureResponse = await axios.post(`${QLOO_BASE_URL}/recommendations`, {
        type: 'entertainment',
        input: {
          positive: [...userInterests.preferences.cultural, ...searchTerms].slice(0, 5),
          negative: []
        },
        limit: 10
      }, { headers });

      recommendations.attractions = cultureResponse.data.results || [];
    } catch (error) {
      console.warn('Qloo culture recommendations failed:', error.message);
    }

    return recommendations;

  } catch (error) {
    console.error('Error calling Qloo API:', error);
    return generateFallbackRecommendations(userInterests);
  }
}

/**
 * Generate fallback recommendations when Qloo API is unavailable
 * @param {Object} userInterests - User interests
 * @returns {Object} Fallback recommendations
 */
function generateFallbackRecommendations(userInterests) {
  const interests = userInterests.interests || [];
  const cultural = userInterests.preferences?.cultural || [];
  const food = userInterests.preferences?.food || [];

  // Smart fallback based on interests
  let destinations = [];
  let restaurants = [];
  let attractions = [];

  // Destination mapping based on common interests
  if (interests.some(i => i.toLowerCase().includes('bts')) || cultural.some(c => c.toLowerCase().includes('k-pop'))) {
    destinations.push({
      id: 'seoul-korea',
      name: 'Seoul',
      country: 'South Korea',
      description: 'K-pop capital and cultural hub',
      type: 'city'
    });
  }

  if (interests.some(i => i.toLowerCase().includes('ghibli')) || cultural.some(c => c.toLowerCase().includes('anime'))) {
    destinations.push({
      id: 'tokyo-japan',
      name: 'Tokyo',
      country: 'Japan',
      description: 'Anime and manga paradise',
      type: 'city'
    });
  }

  if (food.some(f => f.toLowerCase().includes('ramen')) || interests.some(i => i.toLowerCase().includes('ramen'))) {
    restaurants.push({
      id: 'ramen-spots',
      name: 'Authentic Ramen Houses',
      type: 'restaurant',
      cuisine: 'Japanese'
    });
  }

  // Default recommendations if no specific matches
  if (destinations.length === 0) {
    destinations = [
      {
        id: 'paris-france',
        name: 'Paris',
        country: 'France',
        description: 'Cultural capital with world-class museums and cuisine',
        type: 'city'
      },
      {
        id: 'tokyo-japan',
        name: 'Tokyo',
        country: 'Japan',
        description: 'Perfect blend of traditional and modern culture',
        type: 'city'
      }
    ];
  }

  return {
    destinations,
    restaurants,
    attractions,
    experiences: []
  };
}

/**
 * Search for specific venues or attractions
 * @param {string} query - Search query
 * @param {string} location - Location context
 * @returns {Promise<Array>} Search results
 */
export async function searchQlooVenues(query, location = '') {
  try {
    if (!process.env.QLOO_API_KEY) {
      return [];
    }

    const headers = {
      'Authorization': `Bearer ${process.env.QLOO_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(`${QLOO_BASE_URL}/search`, {
      query: query,
      location: location,
      limit: 10
    }, { headers });

    return response.data.results || [];

  } catch (error) {
    console.error('Error searching Qloo venues:', error);
    return [];
  }
}