import React, { useEffect, useRef, useState } from 'react';
import { Activity } from '../types';

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  activities: Activity[];
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ center, activities, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapOptions = {
      center: center,
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
  }, [isLoaded, center]);

  // Add markers for activities
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    activities.forEach((activity, index) => {
      if (!activity.coordinates) return;

      const getMarkerIcon = (type: string) => {
        const colors = {
          attraction: '#3B82F6', // blue
          restaurant: '#F97316', // orange
          transport: '#10B981', // green
          accommodation: '#8B5CF6' // purple
        };
        
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: colors[type as keyof typeof colors] || '#6B7280',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 8
        };
      };

      const marker = new window.google.maps.Marker({
        position: activity.coordinates,
        map: mapInstanceRef.current,
        title: activity.title,
        icon: getMarkerIcon(activity.type),
        animation: window.google.maps.Animation.DROP,
        zIndex: activities.length - index
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">${getActivityEmoji(activity.type)}</span>
              <span class="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                ${activity.type}
              </span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-1">${activity.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${activity.description}</p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">${activity.time}</span>
              <span class="font-semibold text-green-600">$${activity.cost}</span>
            </div>
            ${activity.rating ? `
              <div class="flex items-center gap-1 mt-2">
                <span class="text-yellow-500">★</span>
                <span class="text-sm text-gray-600">${activity.rating}</span>
              </div>
            ` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(activity.coordinates);
    });

    // Fit map to show all markers
    if (activities.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [isLoaded, activities]);

  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'attraction': return '🎯';
      case 'restaurant': return '🍽️';
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      default: return '📍';
    }
  };

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
};

export default InteractiveMap;