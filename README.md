# Globetrotter AI: Your Personal AI Travel Planner

## ✈️ AI-Powered Taste-Based Travel Planning

Globetrotter AI is your personal AI-powered travel planner that uses **semantic search** and **RAG (Retrieval Augmented Generation)** to craft bespoke itineraries based on your unique taste profile. Simply tell us what you love - like "I love BTS, Studio Ghibli, and ramen" - and we'll create a personalized travel experience with interactive 3D map visualizations.

## ✨ Inspiration

The inspiration behind Globetrotter AI stems from the desire to transform travel planning from generic recommendations to truly personalized experiences. By understanding your unique taste profile through AI, we create trips that align with your interests, hobbies, and cultural preferences.

## 🚀 What it does

Globetrotter AI revolutionizes travel planning through:

1. **Taste Profile Analysis**: Using Google's Gemini AI to parse your interests and preferences
2. **Semantic Recommendations**: Leveraging Qloo's Taste API to find destinations, restaurants, and experiences aligned with your unique taste
3. **RAG-Powered Itineraries**: Combining AI reasoning with taste-aligned data to generate comprehensive, personalized day-by-day itineraries
4. **3D Journey Visualization**: Interactive 3D maps with cinematic animations to preview your adventure

## 🛠️ How we built it

### Frontend Architecture
- **React** and **TypeScript** for a robust, type-safe user interface
- **Tailwind CSS** for utility-first styling and responsive design
- **Google Maps API** with advanced 3D visualizations and cinematic camera movements
- **Lucide React** for modern, crisp iconography

### Backend & AI Integration
- **Node.js/Express** backend with RESTful API design
- **Google Gemini AI** for natural language processing and RAG-powered itinerary generation
- **Qloo Taste API** for semantic recommendations based on cultural preferences
- **MongoDB** for data persistence (optional)
- **Axios** for seamless API communication

### Key Features
- Semantic search and taste-based matching
- Real-time AI conversation interface
- Dynamic itinerary generation with cost breakdowns
- Interactive 3D map with activity markers and routing
- Cinematic day-by-day journey visualization

## 🚧 Challenges we ran into

Building an AI-powered taste-based travel planner presented unique challenges:

- **AI Prompt Engineering**: Crafting precise prompts for Gemini to consistently parse user interests and generate structured itinerary data
- **API Integration Complexity**: Seamlessly combining Gemini's language understanding with Qloo's taste recommendations
- **Real-time Data Processing**: Managing the flow from user input → interest parsing → taste matching → itinerary generation
- **3D Map Synchronization**: Coordinating dynamic itinerary data with interactive 3D map visualizations
- **Error Handling**: Implementing robust fallbacks when external APIs are unavailable

## ✅ Accomplishments that we're proud of

We're particularly proud of:

- **Semantic Understanding**: Successfully implementing taste-based travel recommendations that truly understand user preferences
- **RAG Implementation**: Combining multiple AI services to generate coherent, personalized itineraries
- **Cinematic 3D Visualization**: Creating immersive journey previews with smooth camera movements and activity animations
- **Seamless User Experience**: Building an intuitive chat interface that feels natural and engaging
- **API Orchestration**: Successfully integrating multiple external services (Gemini, Qloo, Google Maps) into a cohesive experience

## 🧠 What we learned

Through developing this AI-powered travel planner, we gained valuable insights into:

- **AI Integration Patterns**: Best practices for combining multiple AI services and handling their responses
- **Prompt Engineering**: Crafting effective prompts for consistent, structured AI outputs
- **Semantic Search Implementation**: Understanding how taste-based recommendations can transform user experiences
- **Real-time Data Flow**: Managing complex asynchronous operations across multiple APIs
- **3D Web Visualization**: Advanced techniques for creating engaging, interactive map experiences

## 🔮 What's next for Globetrotter AI

The future roadmap for Globetrotter AI includes:

### Enhanced AI Capabilities
- **Vector Embeddings**: Implementing MongoDB Atlas with vector search for even more accurate taste matching
- **Multi-modal AI**: Adding image and video analysis to understand visual preferences
- **Continuous Learning**: Building user feedback loops to improve recommendation accuracy

### Advanced Features
- **Real-time Pricing**: Integration with booking APIs for live pricing and availability
- **Social Planning**: Collaborative trip planning for groups with different taste profiles
- **AR Preview**: Augmented reality features for destination previews
- **Smart Notifications**: AI-powered travel alerts and recommendations during trips

### Platform Expansion
- **Mobile App**: Native iOS/Android applications with offline capabilities
- **Voice Interface**: Integration with voice assistants for hands-free planning
- **API Platform**: Allowing other travel services to integrate our taste-based recommendations

## ⚙️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (optional, for data persistence)
- Google Gemini API key
- Qloo API key
- Google Maps API key

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd globetrotter-ai
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Edit .env file with your API keys
    ```

3.  **Frontend Setup:**
    ```bash
    cd ..
    npm install
    ```

4.  **Start the application:**
    ```bash
    # Terminal 1: Start backend
    cd backend
    npm start
    
    # Terminal 2: Start frontend
    cd ..
    npm run dev
    ```

5.  **Access the application:**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:3000`

### API Keys Setup
- **Gemini API**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Qloo API**: Request access from [Qloo Developers](https://www.qloo.com/developers)
- **Google Maps**: Get your key from [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 Usage

1. **Start a conversation**: Tell the AI what you love (e.g., "I love BTS, Studio Ghibli, and ramen")
2. **Set your budget**: Specify your travel budget (optional)
3. **Get your itinerary**: The AI will generate a personalized travel plan
4. **Explore in 3D**: Use the interactive map to visualize your journey
5. **Customize**: Ask for modifications or additional recommendations

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.