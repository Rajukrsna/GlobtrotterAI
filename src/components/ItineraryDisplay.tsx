import React, { useRef } from 'react';
import { MapPin, Clock, DollarSign, Star, Calendar, Navigation, Play } from 'lucide-react';
import { TravelPlan } from '../types';
import Enhanced3DMap from './Enhanced3DMap';

interface ItineraryDisplayProps {
  travelPlan: TravelPlan | null;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ travelPlan }) => {
  const dayVisualizationRef = useRef<any>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('ItineraryDisplay received travelPlan:', travelPlan);
  
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

  // Defensive checks for required data
  if (!travelPlan.destination || !travelPlan.itinerary || !Array.isArray(travelPlan.itinerary)) {
    console.error('Invalid travel plan structure:', travelPlan);
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center h-full flex items-center justify-center">
        <div className="text-red-400">
          <MapPin className="w-20 h-20 mx-auto mb-6 text-red-300" />
          <h3 className="text-2xl font-medium text-red-600 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-500 max-w-md mx-auto leading-relaxed">
            There was an issue loading your travel plan. Please try generating a new itinerary.
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
  const allActivities = travelPlan.itinerary?.flatMap(day => 
    day.activities?.filter(activity => activity.coordinates) || []
  );

  const handleDayVisualization = (dayNumber: number) => {
    const foundDay = travelPlan.itinerary?.find(day => day.day === dayNumber);
    const dayActivities = foundDay?.activities?.filter(activity => activity.coordinates) || [];
    
    // Scroll to map section first
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Start visualization after a brief delay to allow scroll to complete
    setTimeout(() => {
      if (dayVisualizationRef.current && dayActivities.length > 0) {
        dayVisualizationRef.current(dayActivities);
      }
    }, 800);
  };

  return (
    <div className="space-y-4 lg:space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg lg:rounded-xl p-4 lg:p-6 text-white sticky top-0 z-10">
        <h2 className="text-xl lg:text-3xl font-bold mb-2">{travelPlan.destination || 'Your Destination'}</h2>
        <p className="text-blue-100 mb-3 lg:mb-4 text-sm lg:text-lg">{travelPlan.duration || 5} days of unforgettable experiences</p>
        <div className="flex flex-wrap gap-2">
          {travelPlan.preferences?.map((pref, index) => (
            <span
              key={index}
              className="px-2 lg:px-3 py-1 bg-white/20 rounded-full text-xs lg:text-sm font-medium backdrop-blur-sm"
            >
              {pref}
            </span>
          )) || null}
        </div>
      </div>

      {/* Enhanced 3D Map */}
      <div ref={mapSectionRef} className="bg-white rounded-lg lg:rounded-xl shadow-lg p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          <span className="hidden sm:inline">Interactive 3D Journey Map</span>
          <span className="sm:hidden">3D Map</span>
        </h3>
        <div className="mb-3 lg:mb-4 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
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
          center={travelPlan.mapCenter || { lat: 40.7128, lng: -74.0060 }}
          activities={allActivities}
          className="h-64 lg:h-96 w-full"
          onDayVisualization={(animateFunction) => {
            dayVisualizationRef.current = animateFunction;
          }}
        />
      </div>

      {/* Cost Overview */}
      {travelPlan.costBreakdown && (
      <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Investment Breakdown
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-xl lg:text-3xl font-bold text-purple-600">${(travelPlan.costBreakdown.accommodation || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Accommodation</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-xl lg:text-3xl font-bold text-orange-600">${(travelPlan.costBreakdown.food || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Dining</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xl lg:text-3xl font-bold text-green-600">${(travelPlan.costBreakdown.transport || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Transport</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xl lg:text-3xl font-bold text-blue-600">${(travelPlan.costBreakdown.activities || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">Experiences</div>
          </div>
        </div>
        <div className="border-t pt-4 lg:pt-6">
          <div className="text-center p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl lg:text-4xl font-bold text-gray-800">${(travelPlan.costBreakdown.total || 0).toLocaleString()}</div>
            <div className="text-base lg:text-lg text-gray-600 mt-1">Total Trip Investment</div>
            <div className="text-sm text-gray-500 mt-2">All expenses included</div>
          </div>
        </div>
      </div>
      )}

      {/* Detailed Itinerary with Animation Buttons */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-lg p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Your Daily Adventure
        </h3>
        <div className="space-y-6 lg:space-y-8">
          {travelPlan.itinerary?.map((day) => (
            <div key={day.day} className="relative">
              {/* Day Header with Visualization Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg gap-3 sm:gap-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div>
                      <h4 className="text-xl lg:text-2xl font-bold text-gray-800">
                        Day {day.day || 1}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {day.date ? new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Date TBD'}
                      </div>
                    </div>
                    
                    {/* Animated Visualization Button */}
                    <button
                      onClick={() => handleDayVisualization(day.day || 1)}
                      className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm lg:text-base"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">
                        <span className="hidden sm:inline">Visualize Day {day.day || 1}</span>
                        <span className="sm:hidden">View Day {day.day || 1}</span>
                      </span>
                    </button>
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <div className="text-xl lg:text-2xl font-bold text-green-600">
                    ${(day.totalCost || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Day Total</div>
                </div>
              </div>
              
              {/* Activities */}
              <div className="space-y-3 lg:space-y-4 ml-2 lg:ml-4 border-l-4 border-blue-200 pl-3 lg:pl-6">
                {day.activities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-50 rounded-lg lg:rounded-xl p-4 lg:p-6 hover:bg-gray-100 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 lg:gap-4 mb-2 lg:mb-3">
                          <span className="text-2xl lg:text-3xl">{getActivityIcon(activity.type || 'attraction')}</span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold text-sm lg:text-base">{activity.time || 'TBD'}</span>
                            </div>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getActivityColor(activity.type || 'attraction')}`}>
                              {(activity.type || 'attraction').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h5 className="font-bold text-lg lg:text-xl text-gray-800 mb-2">{activity.title || 'Activity'}</h5>
                        <p className="text-gray-600 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base">{activity.description || 'Description not available'}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.location || 'Location TBD'}</span>
                          </div>
                          {activity.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{activity.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right lg:ml-4">
                        <div className="text-xl lg:text-2xl font-bold text-green-600">
                          ${(activity.cost || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Cost</div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    <p>No activities planned for this day yet.</p>
                  </div>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              <p>No itinerary data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;