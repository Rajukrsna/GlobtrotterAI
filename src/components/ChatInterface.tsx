import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Message, ConversationState } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  conversationState: ConversationState;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  conversationState 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const getPlaceholder = () => {
    switch (conversationState.step) {
      case 'initial':
        return "Describe your dream trip (e.g., 'I love mountains, want something peaceful')";
      case 'budget':
        return "Enter your budget (e.g., '2000' or '$2000')";
      case 'destinations':
        return "Ask questions about the destinations or say 'show more options'";
      case 'itinerary':
        return "Ask about your itinerary or request modifications";
      default:
        return "Type your message...";
    }
  };

  const getBudgetSuggestions = () => {
    const suggestions = [
      { label: 'Budget Trip', amount: 1000, icon: '💰' },
      { label: 'Mid-Range', amount: 2500, icon: '🏨' },
      { label: 'Luxury', amount: 5000, icon: '✨' },
      { label: 'Ultra Luxury', amount: 10000, icon: '👑' }
    ];

    return (
      <div className="p-4 border-t bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">Quick budget selection:</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.amount}
              onClick={() => onSendMessage(suggestion.amount.toString())}
              className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              disabled={isLoading}
            >
              <span className="text-lg">{suggestion.icon}</span>
              <div>
                <div className="font-medium text-sm">{suggestion.label}</div>
                <div className="text-xs text-gray-500">${suggestion.amount.toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b px-6 py-4">
  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
    <Bot className="w-6 h-6 text-purple-600" />
    Travel Concierge AI
  </h2>
  <p className="text-sm text-gray-500 mt-1">
    {conversationState.step === 'initial' && "Tell me about your dream escape..."}
    {conversationState.step === 'budget' && "What budget are you thinking?"}
    {conversationState.step === 'destinations' && "Explore ideal locations."}
    {conversationState.step === 'itinerary' && "Here’s your tailored plan!"}
  </p>
</div>


      {/* Messages */}
     <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-white">
  {messages.length === 0 && (
    <div className="text-center text-gray-500 mt-10">
      <Bot className="w-16 h-16 mx-auto mb-4 text-purple-400" />
      <p className="text-lg font-medium">Welcome to Globetrotter AI!</p>
      <p className="text-sm mt-2 max-w-md mx-auto">
        Describe what you’re looking for and let’s plan your perfect trip.
      </p>
    </div>
  )}

  {messages.map((message) => (
    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div className={`max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-300
        ${message.role === 'user' 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
          : 'bg-white/70 backdrop-blur border text-gray-800'
        }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span className="text-xs opacity-60 mt-2 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {message.role === 'user' && (
        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  ))}


        {isLoading && (
  <div className="flex items-start gap-3 animate-pulse">
    <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
      <Bot className="w-4 h-4" />
    </div>
    <div className="bg-white/70 px-4 py-3 rounded-2xl backdrop-blur">
      <div className="flex space-x-1">
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce delay-100" />
        <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
    </div>
  </div>
)}


        <div ref={messagesEndRef} />
      </div>

      {/* Budget Suggestions */}
      {conversationState.step === 'budget' && getBudgetSuggestions()}

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-white border-t px-6 py-4">
  <div className="flex items-center gap-3">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={getPlaceholder()}
      className="flex-1 px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
      disabled={isLoading}
    />
    <button
      type="submit"
      disabled={!input.trim() || isLoading}
      className="px-4 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:opacity-90 transition"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
</form>

    </div>
  );
};

export default ChatInterface;