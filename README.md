# Globetrotter AI: Your Personal AI Travel Planner

## ✈️ A New Way to Explore the World

Globetrotter AI is your personal AI-powered travel planner that crafts bespoke itineraries based on your preferences and budget. It brings your journey to life with interactive 3D map visualizations.

## ✨ Inspiration

The inspiration behind Globetrotter AI stems from the desire to transform the often overwhelming process of travel planning into an effortless and engaging experience. We aimed to leverage artificial intelligence to provide highly personalized recommendations and an immersive preview of upcoming adventures, making dream trips a tangible reality.

## 🚀 What it does

Globetrotter AI empowers users to simply describe their travel aspirations and budget. The application then intelligently recommends destinations that align with their desires and generates detailed, day-by-day itineraries. A standout feature is the interactive 3D map visualization, which offers a cinematic, animated journey through the planned activities, allowing users to virtually experience their trip before they even pack their bags.

## 🛠️ How we built it

The application's frontend is meticulously crafted using **React** and **TypeScript**, ensuring a robust and scalable user interface. **Tailwind CSS** provides a utility-first approach for rapid and consistent styling, while **Lucide React** is used for crisp, modern icons. The core of our interactive mapping experience is powered by the **Google Maps API**, enabling both 2D and advanced 3D map visualizations with dynamic camera movements and custom markers. The AI response simulation and initial itinerary generation logic are currently managed through a sophisticated conversational state machine and mock data within the React application itself.

## 🚧 Challenges we ran into

Developing Globetrotter AI presented several interesting challenges:

*   **Complex 3D Map Animations**: Implementing smooth, cinematic camera movements and dynamic marker animations within the Google Maps 3D view required intricate handling of asynchronous operations and precise manipulation of the Google Maps API.
*   **Integrating Conversational Flow**: Managing the multi-step conversation state (from initial wish to budget, destination selection, and itinerary display) and ensuring the AI responds contextually and intelligently was a core challenge.
*   **Dynamic UI Updates**: Ensuring that the various UI components—the chat interface, destination panel, and itinerary display—update seamlessly and responsively based on the conversation state and data loading was crucial for a fluid user experience.

## ✅ Accomplishments that we're proud of

We are particularly proud of:

*   **Interactive 3D Map Visualization**: The ability to visualize a day's itinerary with cinematic camera movements and detailed activity markers is a significant achievement, offering a truly unique and immersive user experience.
*   **Personalized Destination Recommendations**: The system effectively filters and scores destinations based on user preferences and budget, providing relevant and appealing options.
*   **Responsive and Intuitive UI**: We've created a clean, modern, and easy-to-use interface that makes travel planning accessible and enjoyable for everyone.

## 🧠 What we learned

Through the development of Globetrotter AI, we gained:

*   A deepened understanding of the Google Maps JavaScript API, especially its advanced features like 3D views, camera manipulation, and custom marker rendering.
*   Best practices for managing complex state in React applications, particularly within the context of conversational interfaces.
*   Valuable techniques for creating engaging user experiences through subtle animations, dynamic content loading, and thoughtful UI design.

## 🔮 What's next for Globetrotter AI

For now, Globetrotter AI showcases its capabilities with a limited set of famous places, which are currently stored in a local database (or mock data). The next steps for Globetrotter AI involve significantly enhancing its intelligence and data capabilities to provide an even more powerful and personalized experience:

*   **Advanced Destination Matching with Vector Search**: We plan to integrate with **MongoDB Atlas**, storing rich destination descriptions and user preferences as **embeddings**. This will enable highly accurate **semantic search**, allowing the AI to match user queries (converted to embeddings) with the most relevant destinations, moving far beyond simple keyword matching.
*   **Enhanced AI Reasoning with RAG**: By leveraging **Retrieval Augmented Generation (RAG)**, the system will dynamically fetch relevant information from a broader, real-time knowledge base (e.g., detailed travel guides, live event data) based on the vector search results. This information will then be fed to a **Large Language Model (LLM)** to generate even more tailored, comprehensive, and contextually rich responses and itineraries.
*   **Dynamic Itinerary Generation**: Moving towards real-time, dynamic itinerary generation based on a vast array of activities and points of interest, rather than relying on pre-defined mock data.
*   **User Authentication and Saving Plans**: Implementing user accounts to allow travelers to save, modify, and share their personalized travel plans, fostering a more collaborative and persistent planning experience.
## ⚙️ Installation

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone 
    ```
    (Replace `[YOUR_REPOSITORY_URL]` with the actual URL of your GitHub repository once it's hosted.)
2.  **Navigate to the backend project directory:**
    ```bash
    cd backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the backend development server:**
    ```bash
    npm run dev // backend will run on localhost 3000
    ```
    4.  **Start the frontend development server:**
    ```bash
    cd .. //come to the root directory
    npm install
    npm run dev
    ```
    This will typically open the application in your browser at `http://localhost:5173`.


