import React, { useEffect, useRef, useState } from 'react';
import { Activity } from '../types';

interface Enhanced3DMapProps {
  center: { lat: number; lng: number };
  activities: Activity[];
  className?: string;
  onDayVisualization?: (animateFunction: (dayActivities: Activity[]) => void) => void;
}

const Enhanced3DMap: React.FC<Enhanced3DMapProps> = ({ 
  center, 
  activities, 
  className = '',
  onDayVisualization 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const cinematicInfoWindowRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStatus, setAnimationStatus] = useState('');
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const animationRef = useRef<any>(null);
  const speechRef = useRef<any>(null);

  // Voice guide utility function
  const speak = (text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.8;
    
    // Use a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop voice guide
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

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

  // Initialize 3D map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapOptions = {
      center: center,
      zoom: 14,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      tilt: 45,
      heading: 0,
      styles: [
        {
          featureType: 'all',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      rotateControl: true,
      scaleControl: true,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Create reusable cinematic info window
    cinematicInfoWindowRef.current = new window.google.maps.InfoWindow({
      pixelOffset: new window.google.maps.Size(0, -10)
    });

    // Add smooth camera animation
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTilt(60);
        mapInstanceRef.current.setHeading(45);
      }
    }, 1000);

  }, [isLoaded, center]);

  // Optimized smooth camera transition utility
  const smoothCameraTransition = (targetPosition: any, zoom: number, tilt: number, heading: number, duration: number = 2000) => {
    return new Promise<void>((resolve) => {
      const startPosition = mapInstanceRef.current.getCenter();
      const startZoom = mapInstanceRef.current.getZoom();
      const startTilt = mapInstanceRef.current.getTilt();
      const startHeading = mapInstanceRef.current.getHeading();
      
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smoother easing function
        const easeInOutQuart = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        const easedProgress = easeInOutQuart(progress);
        
        const lat = startPosition.lat() + (targetPosition.lat - startPosition.lat()) * easedProgress;
        const lng = startPosition.lng() + (targetPosition.lng - startPosition.lng()) * easedProgress;
        const currentZoom = startZoom + (zoom - startZoom) * easedProgress;
        const currentTilt = startTilt + (tilt - startTilt) * easedProgress;
        const currentHeading = startHeading + (heading - startHeading) * easedProgress;
        
        // Batch map updates to reduce redraws
        mapInstanceRef.current.setOptions({
          center: { lat, lng },
          zoom: currentZoom,
          tilt: currentTilt,
          heading: currentHeading
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  };

  // Optimized cinematic info window content
  const createCinematicContent = (activity: Activity) => {
    return `
      <div class="relative p-4 max-w-xs bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-xl overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-3">
            <div class="text-2xl">${getActivityEmoji(activity.type)}</div>
            <div>
              <div class="text-xs bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full font-medium">
                ${activity.time} • ${activity.type.toUpperCase()}
              </div>
              ${activity.rating ? `
                <div class="flex items-center gap-1 mt-1">
                  <span class="text-yellow-300 text-xs">★</span>
                  <span class="text-xs text-yellow-200">${activity.rating}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <h3 class="font-bold text-lg mb-2 leading-tight">${activity.title}</h3>
          <p class="text-xs text-blue-100 mb-3 leading-relaxed">${activity.description}</p>
          
          <div class="flex items-center justify-between pt-2 border-t border-white/20">
            <div class="text-xs text-blue-200">
              📍 ${activity.location}
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-yellow-300">$${activity.cost}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const animateDayJourney = async (dayActivities: Activity[]) => {
    if (!mapInstanceRef.current || dayActivities.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationStatus('🎬 Starting your cinematic journey...');
    
    // Voice introduction
    speak("Welcome to your personalized travel journey! Let's explore your day together.", { rate: 0.8 });
    
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    // Hide all markers and close info windows
    markersRef.current.forEach(marker => {
      marker.setVisible(false);
      if (marker.infoWindow) marker.infoWindow.close();
    });

    // Close cinematic info window
    if (cinematicInfoWindowRef.current) {
      cinematicInfoWindowRef.current.close();
    }

    // Opening shot - aerial overview
    setAnimationStatus('🚁 Taking off for an aerial view...');
    speak("Taking off for a beautiful aerial view of your destination.");
    
    const bounds = new window.google.maps.LatLngBounds();
    dayActivities.forEach(activity => {
      if (activity.coordinates) bounds.extend(activity.coordinates);
    });
    
    await smoothCameraTransition(
      bounds.getCenter(),
      12,
      75, // High tilt for dramatic aerial view
      0,
      2500
    );
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Journey through each activity with storytelling
    for (let i = 0; i < dayActivities.length; i++) {
      const activity = dayActivities[i];
      if (!activity.coordinates) continue;

      setCurrentActivity(activity);
      
      // Dynamic status messages based on activity type and time
      const getStatusMessage = (activity: Activity, index: number, total: number) => {
        //const timeOfDay = activity.time.toLowerCase();
        const isFirst = index === 0;
        const isLast = index === total - 1;
        
        if (isFirst) return `🌅 Starting your day at ${activity.title}...`;
        if (isLast) return `🌆 Concluding your day at ${activity.title}...`;
        
        if (activity.type === 'restaurant') return `🍽️ Time for ${activity.title}...`;
        if (activity.type === 'attraction') return `🎯 Exploring ${activity.title}...`;
        if (activity.type === 'transport') return `🚗 Moving to ${activity.title}...`;
        if (activity.type === 'accommodation') return `🏨 Checking into ${activity.title}...`;
        
        return `📍 Visiting ${activity.title}...`;
      };
      
      const currentStatus = getStatusMessage(activity, i, dayActivities.length);
      setAnimationStatus(currentStatus);

      // Enhanced voice narration with variety and context
      const getVoiceNarration = (activity: Activity, index: number, total: number) => {
        const isFirst = index === 0;
        const isLast = index === total - 1;
       // const timeOfDay = activity.time.toLowerCase();
        
        if (isFirst) {
          return `Let's begin your adventure at ${activity.title}. ${activity.description.substring(0, 100)}`;
        }
        
        if (isLast) {
          return `We're ending this wonderful day at ${activity.title}. ${activity.description.substring(0, 80)} What a perfect conclusion to your journey!`;
        }
        
        // Middle activities - vary the narration
        const variations = [
          `Next, we're visiting ${activity.title}. ${activity.description.substring(0, 90)}`,
          `Now let's explore ${activity.title}. ${activity.description.substring(0, 85)}`,
          `Our journey continues at ${activity.title}. ${activity.description.substring(0, 95)}`,
          `Time to experience ${activity.title}. ${activity.description.substring(0, 80)}`
        ];
        
        return variations[index % variations.length];
      };
      
      const voiceText = getVoiceNarration(activity, i, dayActivities.length);
      speak(voiceText, { rate: 0.85 });

      // Dramatic approach - start from high altitude
      await smoothCameraTransition(
        activity.coordinates,
        10, // Start high
        85, // Very steep angle
        (i * 90) % 360, // Rotating perspective
        1800
      );

      setAnimationStatus(`Diving into ${activity.title}...`);
      await smoothCameraTransition(
        activity.coordinates,
        18, 
        45, 
        (i * 90 + 45) % 360,
        2000
      );

      // Show activity marker with optimized animation
      const activityMarker = markersRef.current.find(marker => 
        Math.abs(marker.getPosition().lat() - activity.coordinates!.lat) < 0.0001 &&
        Math.abs(marker.getPosition().lng() - activity.coordinates!.lng) < 0.0001
      );
      
      if (activityMarker) {
        activityMarker.setVisible(true);
        activityMarker.setAnimation(window.google.maps.Animation.DROP);
        
        // Optimized bounce effect
        setTimeout(() => {
          activityMarker.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => activityMarker.setAnimation(null), 2000);
        }, 300);
      }

      // Update cinematic info window content and position
      if (cinematicInfoWindowRef.current) {
        cinematicInfoWindowRef.current.setContent(createCinematicContent(activity));
        cinematicInfoWindowRef.current.setPosition(activity.coordinates);
        cinematicInfoWindowRef.current.open(mapInstanceRef.current);
      }

      // Hold the shot - longer for first and last activities
      const holdDuration = (i === 0 || i === dayActivities.length - 1) ? 4000 : 3000;
      setAnimationStatus(`✨ Experiencing ${activity.title}...`);
      await new Promise(resolve => setTimeout(resolve, holdDuration));

      // Close info window
      if (cinematicInfoWindowRef.current) {
        cinematicInfoWindowRef.current.close();
      }

      // Transition shot - pull back and rotate
      if (i < dayActivities.length - 1) {
        setAnimationStatus('🎬 Transitioning to next location...');
        // Only speak transition for longer journeys
        if (dayActivities.length > 3 && i < dayActivities.length - 2) {
          speak("Moving to our next destination.", { rate: 1.0 });
        }
        await smoothCameraTransition(
          activity.coordinates,
          14,
          65,
          (i * 90 + 180) % 360,
          1200
        );
      }

      // Brief pause between activities - shorter for smoother flow
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Grand finale - show the complete journey
    setAnimationStatus('🎆 Revealing your complete journey...');
    speak("Here's your complete journey mapped out beautifully. What an amazing day awaits you!");
    
    // Create optimized path with requestAnimationFrame animation
    const pathCoordinates = dayActivities
      .filter(activity => activity.coordinates)
      .map(activity => activity.coordinates!);

    if (pathCoordinates.length > 1) {
      const journeyPath = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#FF6B6B',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: '#FF6B6B',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1
          },
          offset: '100%',
          repeat: '20px'
        }]
      });

      journeyPath.setMap(mapInstanceRef.current);
      
      // Optimized path animation using requestAnimationFrame
      let offset = 0;
      const animatePath = () => {
        if (!isAnimating) return;
        
        offset = (offset + 2) % 100;
        const icons = journeyPath.get('icons');
        icons[0].offset = offset + '%';
        journeyPath.set('icons', icons);
        
        requestAnimationFrame(animatePath);
      };
      requestAnimationFrame(animatePath);
    }

    // Final overview with all markers visible
    await smoothCameraTransition(
      bounds.getCenter(),
      13,
      55,
      360, // Full rotation
      2500
    );

    // Show all day's markers with staggered animation
    for (let i = 0; i < dayActivities.length; i++) {
      const activity = dayActivities[i];
      const marker = markersRef.current.find(m => 
        Math.abs(m.getPosition().lat() - (activity.coordinates?.lat || 0)) < 0.0001 &&
        Math.abs(m.getPosition().lng() - (activity.coordinates?.lng || 0)) < 0.0001
      );
      
      if (marker) {
        setTimeout(() => {
          marker.setVisible(true);
          marker.setAnimation(window.google.maps.Animation.DROP);
          setTimeout(() => marker.setAnimation(null), 800);
        }, i * 200);
      }
    }

    setAnimationStatus('🎉 Journey complete! Your day awaits...');
    speak("Your cinematic journey is complete! Get ready for an amazing adventure.", { rate: 0.8 });
    await new Promise(resolve => setTimeout(resolve, 2500));

    setIsAnimating(false);
    setAnimationStatus('');
    setCurrentActivity(null);
  };

  // Expose animation function to parent
  useEffect(() => {
    if (onDayVisualization) {
      onDayVisualization(animateDayJourney);
    }
  }, [onDayVisualization, isAnimating]);

  // Add enhanced 3D markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    activities.forEach((activity, index) => {
      if (!activity.coordinates) return;

      const getMarkerIcon = (type: string) => {
        const icons = {
          attraction: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#3B82F6" filter="url(#glow)"/>
                <circle cx="20" cy="20" r="12" fill="white"/>
                <text x="20" y="26" text-anchor="middle" font-size="16" fill="#3B82F6">🎯</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          },
          restaurant: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#F97316" filter="url(#glow)"/>
                <circle cx="20" cy="20" r="12" fill="white"/>
                <text x="20" y="26" text-anchor="middle" font-size="16" fill="#F97316">🍽️</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          },
          transport: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#10B981" filter="url(#glow)"/>
                <circle cx="20" cy="20" r="12" fill="white"/>
                <text x="20" y="26" text-anchor="middle" font-size="16" fill="#10B981">🚗</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          },
          accommodation: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#8B5CF6" filter="url(#glow)"/>
                <circle cx="20" cy="20" r="12" fill="white"/>
                <text x="20" y="26" text-anchor="middle" font-size="16" fill="#8B5CF6">🏨</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          }
        };
        
        return icons[type as keyof typeof icons] || icons.attraction;
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
          <div class="p-4 max-w-sm">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">${getActivityEmoji(activity.type)}</span>
              <div>
                <span class="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-medium">
                  ${activity.type.toUpperCase()}
                </span>
              </div>
            </div>
            <h3 class="font-bold text-lg text-gray-800 mb-2">${activity.title}</h3>
            <p class="text-sm text-gray-600 mb-3 leading-relaxed">${activity.description}</p>
            <div class="flex items-center justify-between text-sm mb-2">
              <div class="flex items-center gap-1 text-blue-600">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                <span class="font-medium">${activity.time}</span>
              </div>
              <span class="font-bold text-green-600 text-lg">$${activity.cost}</span>
            </div>
            ${activity.rating ? `
              <div class="flex items-center gap-1 pt-2 border-t">
                <span class="text-yellow-500 text-lg">★</span>
                <span class="text-sm font-medium text-gray-700">${activity.rating} rating</span>
              </div>
            ` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        
        infoWindow.open(mapInstanceRef.current, marker);
        
        // Smooth camera movement to marker
        mapInstanceRef.current.panTo(activity.coordinates);
        mapInstanceRef.current.setZoom(16);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
      bounds.extend(activity.coordinates);
    });

    // Fit map to show all markers with padding
    if (activities.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
      
      // Ensure good zoom level for 3D view
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(16);
        }
        window.google.maps.event.removeListener(listener);
      });
    }

    // Add route between activities if more than one
    if (activities.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      directionsRenderer.setMap(mapInstanceRef.current);

      const waypoints = activities.slice(1, -1).map(activity => ({
        location: activity.coordinates,
        stopover: true
      }));

      directionsService.route({
        origin: activities[0].coordinates,
        destination: activities[activities.length - 1].coordinates,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading 3D Map Experience...</p>
          <p className="text-sm text-gray-500 mt-1">Preparing your interactive journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`rounded-lg ${className}`}
        style={{ minHeight: '500px' }}
      />
      
      {/* Voice Control Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (!voiceEnabled) {
              speak("Voice guide enabled. I'll narrate your journey!");
            } else {
              stopSpeech();
            }
          }}
          className={`px-3 py-2 rounded-lg shadow-lg transition-all ${
            voiceEnabled 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
        </button>
      </div>
      
      {/* Cinematic Animation Status */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Main status overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-white/50"></div>
                </div>
                <div>
                  <div className="text-lg font-bold">{animationStatus}</div>
                  {currentActivity && (
                    <div className="text-sm text-blue-200 mt-1">
                      📍 {currentActivity.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current activity card */}
          {currentActivity && (
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="text-4xl animate-bounce">
                    {getActivityEmoji(currentActivity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {currentActivity.time}
                      </span>
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        ${currentActivity.cost}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{currentActivity.title}</h3>
                    <p className="text-blue-100 text-sm">{currentActivity.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cinematic overlay effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-black/20 to-transparent"></div>
          </div>

          {/* Stop Animation Button */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => {
                setIsAnimating(false);
                stopSpeech();
                setAnimationStatus('');
                setCurrentActivity(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
            >
              ⏹️ Stop Tour
            </button>
          </div>
        </div>
      )}
      
      {/* 3D Controls Hint */}
      {!isAnimating && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">3D Navigation</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Drag to rotate view</div>
            <div>• Scroll to zoom</div>
            <div>• Click markers for details</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enhanced3DMap;