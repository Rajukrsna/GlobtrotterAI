import React from 'react';
import { Sparkles } from 'lucide-react';
import { Destination } from '../types';
import DestinationCard from './DestinationCard';

interface DestinationPanelProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
  budget: number;
}

const DestinationPanel: React.FC<DestinationPanelProps> = ({ 
  destinations, 
  onSelectDestination, 
  budget 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-bold">Recommended Destination</h2>
        </div>
        <p className="text-blue-100 text-sm">
          Based on your preferences and ${budget.toLocaleString()} budget
        </p>
      </div>

      {/* Destinations Grid */}
      <div className="p-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
        <div className="grid gap-6">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onSelect={onSelectDestination}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationPanel;