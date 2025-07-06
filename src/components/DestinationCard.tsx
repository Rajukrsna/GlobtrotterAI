import React from 'react';
import { MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  isSelected?: boolean;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ 
  destination, 
  onSelect, 
  isSelected = false 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isSelected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={() => onSelect(destination)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{destination.matchScore}%</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{destination.name}</h3>
          <p className="text-white/90 text-sm">{destination.country}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {destination.description}
        </p>

        {/* Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Highlights</h4>
          <div className="flex flex-wrap gap-1">
            {destination.highlights.slice(0, 3).map((highlight, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {highlight}
              </span>
            ))}
            {destination.highlights.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{destination.highlights.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{destination.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>View on map</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              ${destination.estimatedCost.toLocaleString()}
            </span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium">
            Select Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;