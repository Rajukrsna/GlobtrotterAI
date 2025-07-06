import React, { useRef } from 'react';
import { MapPin, Clock, DollarSign, Star, Calendar, Navigation, Play } from 'lucide-react';
import { TravelPlan } from '../types';
import Enhanced3DMap from './Enhanced3DMap';

interface ItineraryDisplayProps {
  travelPlan: TravelPlan | null;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ travelPlan }) => {
  const dayVisualizationRef = useRef<any>(null);

  if (!travelPlan) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center h-full flex items-center justify-center">
        <div className="text-gray-400">
          <MapPin className="w-20 h-20 mx-auto mb-6 text-gray-300" />
          <h3 className="text-2xl font-medium text-gray-600 mb-2">Your Journey Awaits</h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Start chatting with our AI assistant to discover amazing destinations and create your personalized travel plan with interactive 3D maps!
          </p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attraction': return '🎯';
      case 'restaurant': return '🍽️';
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      default: return '📍';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attraction': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'restaurant': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'transport': return 'bg-green-100 text-green-800 border-green-200';
      case 'accommodation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Collect all activities with coordinates for the map
  const allActivities = travelPlan.itinerary.flatMap(day => 
    day.activities.filter(activity => activity.coordinates)
  );

  const handleDayVisualization = (dayNumber: number) => {
    const dayActivities = travelPlan.itinerary
      .find(day => day.day === dayNumber)
      ?.activities.filter(activity => activity.coordinates) || [];
    
    if (dayVisualizationRef.current && dayActivities.length > 0) {
      dayVisualizationRef.current(dayActivities);
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white sticky top-0 z-10">
        <h2 className="text-3xl font-bold mb-2">{travelPlan.destination}</h2>
        <p className="text-blue-100 mb-4 text-lg">{travelPlan.duration} days of unforgettable experiences</p>
        <div className="flex flex-wrap gap-2">
          {travelPlan.preferences.map((pref, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm"
            >
              {pref}
            </span>
          ))}
        </div>
      </div>

      {/* Enhanced 3D Map */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          Interactive 3D Journey Map
        </h3>
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2 font-medium">
            🗺️ Explore your trip in stunning 3D! Click markers for details, drag to rotate the view.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Attractions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Restaurants</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Transport</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Hotels</span>
            </div>
          </div>
        </div>
        <Enhanced3DMap
          center={travelPlan.mapCenter}
          activities={allActivities}
          className="h-96 w-full"
          onDayVisualization={(animateFunction) => {
            dayVisualizationRef.current = animateFunction;
          }}
        />
      </div>

      {/* Cost Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Investment Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">${travelPlan.costBreakdown.accommodation.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Accommodation</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">${travelPlan.costBreakdown.food.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Dining</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">${travelPlan.costBreakdown.transport.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Transport</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">${travelPlan.costBreakdown.activities.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Experiences</div>
          </div>
        </div>
        <div className="border-t pt-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-4xl font-bold text-gray-800">${travelPlan.costBreakdown.total.toLocaleString()}</div>
            <div className="text-lg text-gray-600 mt-1">Total Trip Investment</div>
            <div className="text-sm text-gray-500 mt-2">All expenses included</div>
          </div>
        </div>
      </div>

      {/* Detailed Itinerary with Animation Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Your Daily Adventure
        </h3>
        <div className="space-y-8">
          {travelPlan.itinerary.map((day) => (
            <div key={day.day} className="relative">
              {/* Day Header with Visualization Button */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">
                        Day {day.day}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    {/* Animated Visualization Button */}
                    <button
                      onClick={() => handleDayVisualization(day.day)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Visualize Day {day.day}</span>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${day.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Day Total</div>
                </div>
              </div>
              
              {/* Activities */}
              <div className="space-y-4 ml-4 border-l-4 border-blue-200 pl-6">
                {day.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-3xl">{getActivityIcon(activity.type)}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">{activity.time}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActivityColor(activity.type)}`}>
                              {activity.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h5 className="font-bold text-xl text-gray-800 mb-2">{activity.title}</h5>
                        <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.location}</span>
                          </div>
                          {activity.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{activity.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          ${activity.cost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Cost</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;