import  { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ItineraryDisplay from './components/ItineraryDisplay';
import DestinationPanel from './components/DestinationPanel';
import { Message, TravelPlan, ConversationState, Destination } from './types';
import { getRecommendedDestinations } from './data/destinations';
import { generateItinerary } from './data/mockData';
import { Globe, MapPin, Wallet, Compass, Loader2 } from "lucide-react";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 'initial'
  });
  const [recommendedDestinations, setRecommendedDestinations] = useState<Destination[]>([]);

  const simulateAIResponse = async (userMessage: string, currentState: ConversationState): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let assistantMessage: Message;
    let newState = { ...currentState };

    switch (currentState.step) {
      case 'initial':
        // User described their travel wish
        newState = {
          ...currentState,
          step: 'budget',
          travelWish: userMessage
        };
        
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Perfect! I can see you're interested in "${userMessage}". To create the best recommendations for you, what's your travel budget? This will help me suggest destinations that match both your preferences and financial comfort zone.`,
          timestamp: new Date(),
        };
        break;

      case 'budget':
        // User provided budget
        const budget = parseInt(userMessage.replace(/[$,]/g, ''));
        if (isNaN(budget)) {
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I need a numeric budget to help you better. Please enter your budget as a number (e.g., 2000 for $2,000).",
            timestamp: new Date(),
          };
          break;
        }

        const destinations = await getRecommendedDestinations(currentState.travelWish || '', budget, 6);
        setRecommendedDestinations(destinations);
        
        newState = {
          ...currentState,
          step: 'destinations',
          budget: budget
        };
        
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Excellent! With a budget of $${budget.toLocaleString()}, I've found ${destinations.length} amazing destinations that match your preferences for "${currentState.travelWish}". Each destination is scored based on how well it matches your interests. Check out the recommendations on the right and click on your favorite to see the detailed itinerary!`,
          timestamp: new Date(),
        };
        break;

      case 'destinations':
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I can see you're exploring the destination options! Feel free to click on any destination card to select it and see your personalized itinerary. Each destination has been carefully matched to your preferences and budget.",
          timestamp: new Date(),
        };
        break;

      case 'itinerary':
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Your itinerary looks amazing! You can explore the interactive 3D map to see all your planned activities. Feel free to ask me any questions about your trip, or if you'd like to modify anything!",
          timestamp: new Date(),
        };
        break;

      default:
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm here to help you plan your perfect trip! Tell me about your travel preferences to get started.",
          timestamp: new Date(),
        };
    }

    setMessages(prev => [...prev, assistantMessage]);
    setConversationState(newState);
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await simulateAIResponse(message, conversationState);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDestination = async (destination: Destination) => {
    // Add user selection message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I choose ${destination.name}, ${destination.country}!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Generate itinerary
      const itinerary = await generateItinerary(destination.id, conversationState.budget || 2000);
      setCurrentPlan(itinerary);

      // Update conversation state
      setConversationState({
        ...conversationState,
        step: 'itinerary',
        selectedDestination: destination
      });
     
      // Add assistant response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Fantastic choice! ${destination.name} is perfect for your preferences. I've created a detailed ${itinerary.duration}-day itinerary with a 3D interactive map showing all your activities. Your trip includes ${itinerary.itinerary.reduce((total, day) => total + day.activities.length, 0)} carefully selected experiences within your $${conversationState.budget?.toLocaleString()} budget. Explore the 3D map to see your journey come to life!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRightPanel = () => {
    if (conversationState.step === 'destinations' && recommendedDestinations.length > 0) {
      return (
        <DestinationPanel
          destinations={recommendedDestinations}
          onSelectDestination={handleSelectDestination}
          budget={conversationState.budget || 0}
        />
      );
    }
    
    return <ItineraryDisplay travelPlan={currentPlan} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Header */}
     <div className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-md">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-wide">Globetrotter AI</h1>
              <p className="text-xs text-white/80">Your Personalized Travel Wizard</p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 text-sm bg-white/10 px-4 py-1.5 rounded-full shadow-sm">
            {conversationState.step === 'initial' && (
              <>
                <Compass className="w-4 h-4 animate-pulse" />
                <span>Start your travel adventure</span>
              </>
            )}
            {conversationState.step === 'budget' && (
              <>
                <Wallet className="w-4 h-4" />
                <span>Budget-friendly or lavish?</span>
              </>
            )}
            {conversationState.step === 'destinations' && (
              <>
                <MapPin className="w-4 h-4" />
                <span>Pick your dream place</span>
              </>
            )}
            {conversationState.step === 'itinerary' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building your smart itinerary...</span>
              </>
            )}
          </div>

        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          {/* Chat Interface */}
          <div className="order-2 lg:order-1">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              conversationState={conversationState}
            />
          </div>

          {/* Dynamic Right Panel */}
          <div className="order-1 lg:order-2 overflow-hidden">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;