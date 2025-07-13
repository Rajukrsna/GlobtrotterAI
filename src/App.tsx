import  { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ItineraryDisplay from './components/ItineraryDisplay';
import { Message, TravelPlan, ConversationState } from './types';
import { Globe, MapPin, Wallet, Compass, Loader2, MessageSquare, X } from "lucide-react";
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 'initial'
  });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isChatOpenOnMobile, setIsChatOpenOnMobile] = useState(false);

  const simulateAIResponse = async (userMessage: string, currentState: ConversationState): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let assistantMessage: Message;
    let newState = { ...currentState };

    switch (currentState.step) {
      case 'initial':
        // User described their travel wish - now we generate the full plan
        newState = {
          ...currentState,
          step: 'generating',
          travelWish: userMessage
        };
        
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Perfect! I love your taste - "${userMessage}" sounds amazing! 🎯 Let me work my magic and create a personalized travel plan just for you. I'm analyzing your interests, finding taste-aligned destinations, and crafting the perfect itinerary. This might take a moment...`,
          timestamp: new Date(),
        };
        
        // Start generating the travel plan
        setTimeout(() => generateTravelPlan(userMessage), 1000);
        break;

      case 'budget':
        // Handle budget if user provides it
        newState = {
          ...currentState,
          step: 'generating',
          budget: parseInt(userMessage.replace(/[$,]/g, '')) || 2500
        };
        
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Got it! With your budget, I'm creating an amazing personalized itinerary. Using AI to match your tastes with perfect destinations and experiences...`,
          timestamp: new Date(),
        };
        
        setTimeout(() => generateTravelPlan(currentState.travelWish || userMessage, newState.budget), 1000);
        break;

      case 'generating':
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm still working on your perfect trip! Analyzing your taste profile and matching it with amazing destinations...",
          timestamp: new Date(),
        };
        break;

      case 'itinerary':
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Your personalized itinerary is ready! 🗺️ Explore the interactive 3D map to see all your taste-aligned activities. Each recommendation is carefully selected based on your interests. Feel free to ask me any questions about your trip!",
          timestamp: new Date(),
        };
        break;

      default:
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm here to help you plan your perfect trip! Tell me about your interests, hobbies, or what you love - like 'I love BTS, Studio Ghibli, and ramen' - and I'll create a personalized travel experience just for you!",
          timestamp: new Date(),
        };
    }

    setMessages(prev => [...prev, assistantMessage]);
    setConversationState(newState);
  };

  const generateTravelPlan = async (userMessage: string, budget: number = 2500) => {
    setIsGeneratingPlan(true);
    
    try {
      console.log('Generating travel plan for:', userMessage);
      
      const response = await axios.post('http://localhost:3000/api/plan-trip', {
        message: userMessage,
        budget: budget
      });

      if (response.data.success) {
        const { travelPlan } = response.data;
        setCurrentPlan(travelPlan);
        
        // Update conversation state to show itinerary
        setConversationState(prev => ({
          ...prev,
          step: 'itinerary'
        }));

        // Add success message
        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🎉 Your personalized ${travelPlan.duration}-day trip to ${travelPlan.destination} is ready! I've crafted this itinerary based on your unique taste profile, featuring ${travelPlan.itinerary.reduce((total, day) => total + day.activities.length, 0)} carefully selected experiences. Total cost: $${travelPlan.costBreakdown.total.toLocaleString()}. Explore the 3D map to see your journey come to life!`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error generating travel plan:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble creating your travel plan right now. This might be due to API connectivity. Please make sure your Gemini and Qloo API keys are properly configured, or try again in a moment!",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationState(prev => ({ ...prev, step: 'initial' }));
    } finally {
      setIsGeneratingPlan(false);
      setIsLoading(false);
    }
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
            <div className="hidden sm:block">
              <h1 className="text-2xl font-semibold tracking-wide">Globetrotter AI</h1>
              <p className="text-xs text-white/80">AI-Powered Taste-Based Travel Planner</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xl font-semibold tracking-wide">Globetrotter AI</h1>
            </div>
          </div>

          {/* Right section - Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm bg-white/10 px-4 py-1.5 rounded-full shadow-sm">
            {conversationState.step === 'initial' && (
              <>
                <Compass className="w-4 h-4 animate-pulse" />
                <span>Tell me what you love!</span>
              </>
            )}
            {conversationState.step === 'budget' && (
              <>
                <Wallet className="w-4 h-4" />
                <span>What's your budget?</span>
              </>
            )}
            {conversationState.step === 'generating' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI crafting your perfect trip...</span>
              </>
            )}
            {conversationState.step === 'itinerary' && (
              <>
                <MapPin className="w-4 h-4" />
                <span>Your journey is ready!</span>
              </>
            )}
          </div>

          {/* Mobile Chat Button */}
          <button
            onClick={() => setIsChatOpenOnMobile(true)}
            className="lg:hidden flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all shadow-sm"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Chat</span>
            {messages.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.filter(m => m.role === 'user').length}
              </span>
            )}
          </button>

        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)]">
          
          {/* Itinerary Display - Always visible, priority on mobile */}
          <div className="order-1 lg:order-2 overflow-hidden">
            <ItineraryDisplay travelPlan={currentPlan} />
          </div>

          {/* Chat Interface - Desktop: sidebar, Mobile: overlay */}
          <div className={`
            lg:order-1 lg:relative lg:block
            ${isChatOpenOnMobile ? 'fixed inset-0 z-50 bg-white' : 'hidden lg:block'}
          `}>
            {/* Mobile Chat Header */}
            <div className="lg:hidden bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-lg font-semibold">AI Travel Assistant</h2>
              </div>
              <button
                onClick={() => setIsChatOpenOnMobile(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Interface Component */}
            <div className="h-full lg:h-auto">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading || isGeneratingPlan}
              conversationState={conversationState}
            />
          </div>
          </div>

        </div>
      </div>

      {/* Mobile Chat Backdrop */}
      {isChatOpenOnMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsChatOpenOnMobile(false)}
        />
      )}
    </div>
  );
}

export default App;